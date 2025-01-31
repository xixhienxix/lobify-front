import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, signal, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material/core";
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { CustomAdapter, CustomDateParserFormatter } from "src/app/tools/date-picker.utils";
import { CustomMaterialDateAdapter } from "../_helpers/date.custom.formater";
import { Dias } from "src/app/models/days.model";
import { Habitacion } from "src/app/models/habitaciones.model";
import { listaCamas } from "../promo.component";
import { Prompt } from "src/app/models/prompt.model";


@Component({
    selector:'app-nva-promo',
    styleUrls:['./nva-promo.component.scss'],
    templateUrl:'./nva-promo.component.html',
    encapsulation:ViewEncapsulation.None,
    providers: [
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
      ]
})
export class NuevaPromocionModalComponent implements OnInit{
    
      readonly options =signal<Dias[]> ([
          {rateIndex:0, name:'Lun', value:0, checked:false},
          {rateIndex:0, name:'Mar', value:1, checked:false},
          {rateIndex:0, name:'Mie', value:2, checked:false},
          {rateIndex:0, name:'Jue', value:3, checked:false},
          {rateIndex:0, name:'Vie', value:4, checked:false},
          {rateIndex:0, name:'Sab', value:5, checked:false},
          {rateIndex:0, name:'Dom', value:6, checked:false}
        ]);

    formGroup:FormGroup
    porcentajeChecked:boolean=false
    precioFijoChecked:boolean=false
    selectedTabIndex: number = 0;

      // Flag to track if any checkbox is selected
    isInvalid = false;
    showErrors: boolean = false;

    @Input() disponiblesIndexadosCamas:listaCamas[]=[]
    @Output() honAlertsEvent : EventEmitter<Prompt> = new EventEmitter();

    /**Valid Cupon Dates */
    intialDateFC = new FormControl(new Date());
    endDateFC = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));
    selectedCamas: string[] = [];


    intialDateFCCheckIn = new FormControl(new Date());
    endDateFCCheckIn = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));

    initialDate: Date | null = null; // Variable to store start date
    endDate: Date | null = null; // Variable to store end date

    promoOptions = [
        { label: 'PROMO ACTIVA', value: true },
        { label: 'PROMO DESACTIVADA', value: false }
      ];

      promoFields = [
        { label: 'PromosComponent.NombrePromo', id: 'name', name: 'name', formControlName: 'nombre', isTextarea: false },
        { label: 'PromosComponent.codigoPromo', id: 'codigo', name: 'codigo', formControlName: 'codigo', isTextarea: false },
        { label: 'PromosComponent.numeroVeces', id: 'inventario', name: 'inventario', formControlName: 'inventario', isTextarea: false },
        { label: 'PromosComponent.desc', id: 'desc', name: 'desc', formControlName: 'desc', isTextarea: true }
      ];
    
    constructor( 
        public modal:NgbActiveModal,
        private fb : FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.formGroup = this.fb.group({
            estado:[false,Validators.required],
            nombre:['',Validators.required],
            codigo:['',Validators.required],
            qtyPrecio:[0,Validators.required],
            inventario:[100,Validators.required],
            minNoches:[1,Validators.required],
            maxNoches:[0,Validators.required],
            desc:['']
        })
    }

    ngOnInit(): void {
        console.log('Date format is set to: DD/MM/YYYY');

        // Listen for changes in FormControls (alternative to (dateChange) in HTML)
    this.intialDateFC.valueChanges.subscribe(value => {
        console.log('Fecha de Llegada Cambiada:', value);
        this.initialDate = value;
      });
  
      this.endDateFC.valueChanges.subscribe(value => {
        console.log('Fecha de Salida Cambiada:', value);
        this.endDate = value;
      });

      this.intialDateFCCheckIn.valueChanges.subscribe(value => {
        console.log('Fecha de Llegada Cambiada:', value);
        this.initialDate = value;
      });
  
      this.endDateFCCheckIn.valueChanges.subscribe(value => {
        console.log('Fecha de Salida Cambiada:', value);
        this.endDate = value;
      });
    }

    onTabChange(index: number) {
        this.selectedTabIndex = index;
    }

    handleDiscountChange(event:any){
        console.log('discountEvent:', event);
    }

    onSubmit(){
        const nombreControl = this.formGroup.get('nombre');
        const codigoControl = this.formGroup.get('codigo');

        this.showErrors = true;
      
        // Clear previous errors before applying new ones
        nombreControl?.setErrors(null);
        codigoControl?.setErrors(null);
      
        if (nombreControl?.value === '') {
          nombreControl.setErrors({ 'required': true });
          nombreControl.markAsTouched();  // Mark as touched for validation
          nombreControl.markAsDirty();    // Mark as dirty to trigger validation immediately
        }
      
        if (codigoControl?.value === '') {
          codigoControl.setErrors({ 'required': true });
          codigoControl.markAsTouched();  // Mark as touched for validation
          codigoControl.markAsDirty();    // Mark as dirty to trigger validation immediately
        }

        const anyChecked = this.options().some(option => option.checked);
        if (!anyChecked) {
            this.honAlertsEvent.emit({ title: 'Advertencia', message: 'Selecciona almenos un dia de la semana valido' });
            return
        }

          // Check if the form is invalid
        if (this.formGroup.invalid ) {
            this.honAlertsEvent.emit({ title: 'Advertencia', message: 'Faltan Datos por capturar' });
            return; // Prevent form submission
        }


        const formValues: { [key: string]: any } = {};  // <-- Add index signature

        // Loop through all form controls and get their values
        Object.keys(this.formGroup.controls).forEach(controlName => {
          const control = this.formGroup.get(controlName);
          if (control) {
            formValues[controlName] = control.value;
          }
        });

        console.log('submit values', formValues)

    }

    selectionChanged(camasSelected:any){
        this.selectedCamas = camasSelected;  // Store the selected camas values
        console.log('Selected Camas:', this.selectedCamas);  // You can use the selected values here    
        }

    // Define the date filter function
    dateFilter = (d: Date | null): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Clear time part of today's date
      return d ? d >= today : false; // Disable dates before today
    };

    getOption(checked: boolean, index: number) {
        // Update the options based on the index
        this.options.update(item => {
          if (index !== undefined) {
            item[index].rateIndex = 0;
            item[index].checked = checked;
          }
          return item;
        });
      }
    


    // Called when user selects a new start date
    addEventIntialDate(type: string, event: any) {
        if (event.value) {
        this.initialDate = event.value;
        this.intialDateFC.setValue(event.value); // Update FormControl
        console.log('Fecha de Llegada Seleccionada:', this.initialDate);
        }
    }

    // Called when user selects a new end date
    addEventEndDate(type: string, event: any) {
        if (event.value) {
        this.endDate = event.value;
        this.endDateFC.setValue(event.value); // Update FormControl
        console.log('Fecha de Salida Seleccionada:', this.endDate);
        }
    }

        // Called when user selects a new start date
    addEventIntialDateCheckIn(type: string, event: any) {
        if (event.value) {
            this.initialDate = event.value;
            this.intialDateFC.setValue(event.value); // Update FormControl
            console.log('Fecha de Llegada Seleccionada:', this.initialDate);
        }
    }
    
        // Called when user selects a new end date
    addEventEndDateCheckIn(type: string, event: any) {
        if (event.value) {
            this.endDate = event.value;
            this.endDateFC.setValue(event.value); // Update FormControl
            console.log('Fecha de Salida Seleccionada:', this.endDate);
        }
    }

    isSecondControlInvalid(controlName: string): boolean {
        const control = this.formGroup.controls[controlName];
        return control.invalid && (control.dirty || control.touched);
    }

    isSecondControlValid(controlName: string): boolean {
        const control = this.formGroup.controls[controlName];
        return control.valid && (control.dirty || control.touched);
    }

}