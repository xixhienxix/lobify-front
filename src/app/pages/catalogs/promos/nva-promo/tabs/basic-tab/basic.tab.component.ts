import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material/core";
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { CustomAdapter, CustomDateParserFormatter } from "src/app/tools/date-picker.utils";
import { Dias } from "src/app/models/days.model";
import { Habitacion } from "src/app/models/habitaciones.model";
import { Prompt } from "src/app/models/prompt.model";
import { listaCamas } from "../../../promo.component";
import { nonZeroRequired } from "../../../_helpers/validators/nonzero.validators";
import { alphanumericValidator } from "../../../_helpers/validators/onlyalphanumeric.validator";
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
    selectedCamas: string[] = [];
    selectedRate: string = ''; // This will store the selected value ('low' or 'high')

    intialDateFC: FormControl;
    endDateFC: FormControl;
    intialDateFCCheckIn: FormControl;
    endDateFCCheckIn: FormControl;

    specialCharacterOnInput:boolean=false;

    initialDate: Date | null = null; // Variable to store start date
    endDate: Date | null = null; // Variable to store end date

    controlTabMap = new Map<string, number[]>([
      ['estado', [0, 1, 2, 3]],
      ['promoFields', [0, 1, 2]], // except 'name' shown also in 3
      ['name', [0, 1, 2, 3]], // explicitly rendered in tab 3
      ['stay', [3]],
      ['payonly', [3]],
      ['rateType', [3]],
      ['intialDateFC', [0, 3]],
      ['endDateFC', [0, 3]],
      ['intialDateFCCheckIn', [0, 1, 2, 3]],
      ['endDateFCCheckIn', [0, 1, 2, 3]],
      ['anticipatedNights', [1]],
      ['anticipatedNightsmax', [2]],
      ['minNoches', [0, 1, 2]],
      ['maxNoches', [0, 1, 2]],
      ['validDays', [0, 1, 2, 3]],
      ['desc', [0, 1, 2, 3]],
      ['camasSelect', [0, 1, 2, 3]],
      ['discountSelector', [0, 1, 2]]
    ]);

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
    )  // Initialize FormControls first{}
    {
    this.intialDateFC = new FormControl(new Date(), Validators.required);
    this.endDateFC = new FormControl(new Date(Date.now() + 1000 * 3600 * 24), Validators.required);
    this.intialDateFCCheckIn = new FormControl(new Date(), Validators.required);
    this.endDateFCCheckIn = new FormControl(new Date(Date.now() + 1000 * 3600 * 24), Validators.required);
  
    // Use them in the form group
    this.formGroup = this.fb.group({
      estado: [false, Validators.required],
      rateType: [false, Validators.required],
      nombre: ['', Validators.required],
      codigo: ['', [Validators.required, alphanumericValidator]],
      qtyPrecio: [0, Validators.required],
      inventario: [100, Validators.required],
      minNoches: [1, Validators.required],
      maxNoches: [0, nonZeroRequired],
      
      // Use the already initialized FormControls
      intialDateFCCheckIn: this.intialDateFCCheckIn,
      endDateFCCheckIn: this.endDateFCCheckIn,
      intialDateFC: this.intialDateFC,
      endDateFC: this.endDateFC,
  
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
      let response: formResponse;
  
      // Get relevant controls for the active tab
      const relevantControls = this.getRelevantControls();
      console.log('Relevant Controls:', relevantControls);
  
      // Mark relevant controls as touched to trigger validation messages
      relevantControls.forEach(control => {
          if (control && control.markAsTouched) {
              control.markAsTouched();
          }
      });
  
      // Log each control's validation state after marking as touched
      relevantControls.forEach((control, index) => {
          const controlName = Object.keys(this.formGroup.controls)[index];
          if (control) {
              console.log(`${controlName}: Invalid = ${control.invalid}, Touched = ${control.touched}, Value = ${control.value}`);
              console.log(`${controlName} Errors:`, control.errors); // Check validation errors
          }
      });
  
      // Check if any relevant control is invalid
      const anyInvalid = relevantControls.some(control => control && control.invalid);
      console.log('Is form valid?', !anyInvalid);  // Log the final validation result
      if (anyInvalid) {
          this.honAlertsEvent.emit({ title: 'Advertencia', message: 'Faltan Datos por capturar en esta pestaña' });
          response = { response: false, data: [] };
          return response;
      }
  
      // Additional validations...
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
  
      // Gather all form values regardless of tab
      const formValues: { [key: string]: any } = {};
      Object.keys(this.formGroup.controls).forEach(controlName => {
          const control = this.formGroup.get(controlName);
          if (control) {
              formValues[controlName] = control.value;
          }
      });
  
      console.log('Collected Data:', formValues); // Log the collected form data
  
      response = { response: true, data: formValues };
      return response;
  }
  
  
  
  getRelevantControls(): AbstractControl[] {
    return Object.keys(this.formGroup.controls)
        .filter(controlName => {
            const allowedTabs = this.controlTabMap.get(controlName);
            const isRelevant = allowedTabs ? allowedTabs.includes(this.tabIndex) : false;
            console.log(`Control: ${controlName}, Relevant for tab ${this.tabIndex}: ${isRelevant}`);
            return isRelevant;
        })
        .map(controlName => this.formGroup.get(controlName))
        .filter((control): control is AbstractControl => control !== null); // Ensure it's a valid control
}



isControlInActiveTab(controlName: string): boolean {
  // Example logic, modify as per your tab logic:
  switch (this.tabIndex) {
      case 0:
          return controlName.startsWith('tab0_'); // Controls related to tab 0
      case 1:
          return controlName.startsWith('tab1_'); // Controls related to tab 1
      case 2:
          return controlName.startsWith('tab2_'); // Controls related to tab 2
      default:
          return false; // In case no tab matches, return false
  }
}


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

    onCodigoBlur(field: any) {
      if (field.id === 'codigo') {
        const ctrl = this.formGroup.get('codigo');
        if (ctrl) {
          const cleaned = (ctrl.value || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          ctrl.setValue(cleaned);
        }
      }
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