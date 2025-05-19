import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, signal, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from "@angular/material/core";
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { CustomAdapter, CustomDateParserFormatter } from "src/app/tools/date-picker.utils";
import { CustomMaterialDateAdapter } from "../_helpers/date.custom.formater";
import { Dias } from "src/app/models/days.model";
import { Habitacion } from "src/app/models/habitaciones.model";
import { listaCamas } from "../promo.component";
import { Prompt } from "src/app/models/prompt.model";
import { BasicTabComponent, formResponse } from "./tabs/basic-tab/basic.tab.component";
import { PromosService } from "src/app/services/promos.service";
import { title } from "process";
import { Parametros } from "src/app/pages/parametros/_models/parametros";


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

    selectedTabIndex: number = 0;
    formArray: FormArray;

      // Flag to track if any checkbox is selected
    isInvalid = false;
    showErrors: boolean = false;

    @Input() currentParametros:Parametros
    @Input() disponiblesIndexadosCamas:listaCamas[]=[]
    @Output() honAlertsEvent : EventEmitter<Prompt> = new EventEmitter();

    @ViewChild('basicTab') basicTabComponent!: BasicTabComponent;
    @ViewChild('anticipadaTab') anticipadaTabComponent!: BasicTabComponent;
    @ViewChild('lastminuteTab') lastminuteTabComponent!: BasicTabComponent;
    @ViewChild('freenightTab') freenightTabComponent!: BasicTabComponent;
    
    
    constructor( 
        public modal:NgbActiveModal,
        private fb : FormBuilder,
        private _promosService:PromosService,
    ) {
        this.formArray = this.fb.array([]);
    }

    ngOnInit(): void {
          
    }

    onTabChange(index: number) {
        this.selectedTabIndex = index;
    }

    onSubmit() {
        const currentTabComponent = this.getCurrentTabComponent();
      
        // Validate and get data from the active tab
        const isTabValid = currentTabComponent.onSubmit(); // assuming this returns a boolean
        const tabData = currentTabComponent.getFormData();
      
        if (!isTabValid) {
          this.onAlertsEvent({ title: 'Error', message: 'Por favor llena los campos requeridos en esta pestaña' });
          return;
        }
      
        // Validate on parent level too
        const validationResult = this.validateObjects([tabData]);
      
        if (validationResult[0].isValid) {
          this._promosService.postPromo({ ...tabData }).subscribe({
            next: (response) => {
              if (response.success && response.exist) {
                this.onAlertsEvent({ title: 'Error', message: 'El código de promoción ya existe. Ingresa uno diferente.' });
              } else if (response.success && response.message === 'Promos created successfully') {
                this.onAlertsEvent({ title: 'Éxito', message: 'Promociones guardadas.' });
                this.modal.dismiss();
              }
            },
            error: (err) => {
              this.onAlertsEvent({ title: 'Error', message: 'Hubo un problema al guardar la promoción.' });
            }
          });
        }
      }
      

    getCurrentTabComponent(): BasicTabComponent {
        switch (this.selectedTabIndex) {
          case 0: return this.basicTabComponent;
          case 1: return this.anticipadaTabComponent;
          case 2: return this.lastminuteTabComponent;
          case 3: return this.freenightTabComponent;
          default: throw new Error('Unknown tab index');
        }
      }
      

      validateObjects(data: any[]) {
        this.formArray.clear(); // Clear previous entries
      
        data.forEach(item => {
          const formGroup = this.fb.group({
            estado: [item.estado, Validators.required],
            rateType: [item.rateType, Validators.required],
            nombre: [item.nombre, Validators.required],
            codigo: [item.codigo, Validators.required],
            qtyPrecio: [item.qtyPrecio, Validators.required],
            inventario: [item.inventario, Validators.required],
            minNoches: [item.minNoches, Validators.required],
            maxNoches: [item.maxNoches, Validators.required],
            intialDateFCCheckIn: [item.intialDateFCCheckIn, Validators.required],
            endDateFCCheckIn: [item.endDateFCCheckIn, Validators.required],
            intialDateFC: [item.intialDateFC, Validators.required],
            endDateFC: [item.endDateFC, Validators.required],
            desc: [item.desc],
            anticipatedNights: [item.anticipatedNights, [Validators.required, this.qtyNightsValidator.bind(this)]],
            anticipatedNightsmax: [item.anticipatedNightsmax, [Validators.required, this.qtyNightsValidator.bind(this)]],
            payonly: [item.payonly, [Validators.required, this.qtyNightsValidator.bind(this)]],
            stay: [item.stay, [Validators.required, this.qtyNightsValidator.bind(this)]],
            selectedDays: [item.selectedDays]
          });
      
          // ✅ Debug log form value and status
          formGroup.statusChanges.subscribe(status => {
            console.log('Form status changed:', status);
            console.log('Current form value:', formGroup.value);
          });
      
          this.formArray.push(formGroup);
        });
      
        const validationResults = this.formArray.controls.map(control => ({
          isValid: control.valid
        }));
      
        console.log('Is form valid?', this.formArray.valid);
        return validationResults;
      }
      
      

      qtyNightsValidator(control: FormControl) {
        const value = control.value;
        return value >= 1 ? null : { invalidQty: true }; // Custom validation
      }

    onAlertsEvent(event:any){
        this.honAlertsEvent.emit(event);
    }

}