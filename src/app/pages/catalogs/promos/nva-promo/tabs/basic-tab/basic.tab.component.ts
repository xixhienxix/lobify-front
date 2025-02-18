import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material/core";
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { CustomAdapter, CustomDateParserFormatter } from "src/app/tools/date-picker.utils";
import { Dias } from "src/app/models/days.model";
import { Habitacion } from "src/app/models/habitaciones.model";
import { Prompt } from "src/app/models/prompt.model";
import { listaCamas } from "../../../promo.component";
export type formResponse  = {
    response:boolean,
    data:{ [key: string]: any }
}

@Component({
    selector:'app-basic-tab',
    styleUrls:['./basic.tab.component.scss'],
    templateUrl:'./basic.tab.component.html',
    encapsulation:ViewEncapsulation.None,
    providers: [
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
      ]
})
export class BasicTabComponent implements OnInit, OnChanges{
    
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
      // Flag to track if any checkbox is selected
    isInvalid = false;
    showErrors: boolean = false;

    @Input() tabIndex: number = 0;
    @Input() disponiblesIndexadosCamas:listaCamas[]=[]
    @Output() honAlertsEvent : EventEmitter<Prompt> = new EventEmitter();

    /**Valid Cupon Dates */
    intialDateFC = new FormControl(new Date());
    endDateFC = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));
    selectedCamas: string[] = [];
    selectedRate: string = ''; // This will store the selected value ('low' or 'high')


    intialDateFCCheckIn = new FormControl(new Date());
    endDateFCCheckIn = new FormControl(new Date((new Date()).valueOf() + 1000*3600*24));

    initialDate: Date | null = null; // Variable to store start date
    endDate: Date | null = null; // Variable to store end date

    promoOptions = [
        { label: 'PROMO ACTIVA', value: true },
        { label: 'PROMO DESACTIVADA', value: false }
      ];

      radioRatesOptions = [
        { label: 'LA MAS BAJA', value: 'low' },
        { label: 'LA MAS CARA', value: 'high' }
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
            estado: [false, Validators.required],
            rateType: [false, Validators.required],
            nombre: ['', Validators.required],
            codigo: ['', Validators.required],
            qtyPrecio: [0, Validators.required],
            inventario: [100, Validators.required],
            minNoches: [1, Validators.required],
            maxNoches: [0, Validators.required],
            intialDateFCCheckIn: [null, Validators.required], // Add this
            endDateFCCheckIn: [null, Validators.required], // Add this
            intialDateFC: [null, Validators.required], 
            endDateFC: [null, Validators.required],
            desc: [''],
            anticipatedNights: [1, [Validators.required, this.qtyNightsValidator.bind(this)]],
            anticipatedNightsmax: [1, [Validators.required, this.qtyNightsValidator.bind(this)]],
            payonly: [1, [Validators.required, this.qtyNightsValidator.bind(this)]],
            stay: [1, [Validators.required, this.qtyNightsValidator.bind(this)]],
          });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tabIndex'] && !changes['tabIndex'].firstChange) {
          this.updateValidatorsBasedOnTabIndex();
        }
      }

      // Dynamically update form field validators based on the selected tabIndex
    updateValidatorsBasedOnTabIndex() {
        const controls = this.formGroup.controls;

        // Example logic: Disable or enable validators based on tabIndex
        if (this.tabIndex === 0) {
        // For tabIndex 0, make 'nombre' and 'codigo' required
        controls['nombre'].setValidators([Validators.required]);
        controls['codigo'].setValidators([Validators.required]);
        controls['anticipatedNights'].clearValidators();
        } else if (this.tabIndex === 1) {
        // For tabIndex 1, make 'anticipatedNights' required
        controls['nombre'].clearValidators();
        controls['codigo'].clearValidators();
        controls['anticipatedNights'].setValidators([Validators.required, this.qtyNightsValidator.bind(this)]);
        } else if (this.tabIndex === 2) {
        // For tabIndex 2, adjust fields similarly
        controls['nombre'].setValidators([Validators.required]);
        controls['codigo'].setValidators([Validators.required]);
        controls['anticipatedNightsmax'].setValidators([Validators.required]);
        } else if (this.tabIndex === 3) {
        // For tabIndex 3, set different rules
        controls['stay'].setValidators([Validators.required]);
        controls['payonly'].setValidators([Validators.required]);
        controls['desc'].clearValidators();
        }
        // Mark all controls as dirty so validation triggers
        Object.keys(controls).forEach(control => controls[control].updateValueAndValidity());
    }

    qtyNightsValidator(control:any) {
        if (control.value < 1) {
          return { 'invalidQty': true };
        }
        return null;
      }

    ngOnInit(): void {

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

    handleDiscountChange(event:any){
        console.log('discountEvent:', event);
    }

    onSubmit() {
        this.formGroup.markAllAsTouched(); // Mark all fields as touched to trigger validation
    
        let response: formResponse;
    
        // Check if any form field is invalid
        if (this.formGroup.invalid) {
            this.honAlertsEvent.emit({ title: 'Advertencia', message: 'Faltan Datos por capturar en una o más pestañas' });
            response = { response: false, data: [] };
            return response;
        }
    
        // Validate if at least one day is selected
        const anyChecked = this.options().some(option => option.checked);
        if (!anyChecked) {
            this.honAlertsEvent.emit({ title: 'Advertencia', message: 'Selecciona al menos un día de la semana válido' });
            response = { response: false, data: [] };
            return response;
        }
    
        // Validate the date range
        if (!this.initialDate || !this.endDate || this.initialDate > this.endDate) {
            this.honAlertsEvent.emit({ title: 'Advertencia', message: 'Las fechas no son válidas' });
            response = { response: false, data: [] };
            return response;
        }
    
        // Gather all form values
        const formValues: { [key: string]: any } = {};
        Object.keys(this.formGroup.controls).forEach(controlName => {
            const control = this.formGroup.get(controlName);
            if (control) {
                formValues[controlName] = control.value;
            }
        });
    
        // Send success response
        response = { response: true, data: formValues };
        return response;
    }
    

    // getActiveTabForm(): FormGroup {
    //     const activeTab = this.tabIndex; // Ensure you have a way to track the active tab index
    //     return this.formTabs[activeTab]; // Assuming you store forms per tab in an array `formTabs`
    // }
    
    

    getFormData() {
        const formValues: { [key: string]: any } = {};
        
        // Loop through all form controls and get their values
        Object.keys(this.formGroup.controls).forEach(controlName => {
            const control = this.formGroup.get(controlName);
            if (control) {
                formValues[controlName] = control.value;
            }
        });
        
        // Optionally, include additional data like selected days or other inputs
        formValues.selectedDays = this.options().filter(option => option.checked).map(option => option.name);
    
        return formValues;
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