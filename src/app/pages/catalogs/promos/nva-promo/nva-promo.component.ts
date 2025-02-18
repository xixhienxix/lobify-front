import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, QueryList, signal, ViewChildren, ViewEncapsulation } from "@angular/core";
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

    @ViewChildren(BasicTabComponent) tabs!: QueryList<BasicTabComponent>;

    
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

    onSubmit(){
    // Run validation on each tab
        const responses: formResponse[] = this.tabs.map(tab => tab.onSubmit());

        // Log collected data
        const allTabData = this.tabs.map(tab => tab.getFormData());
        console.log('Collected Data:', allTabData);

        const result = this.validateObjects(allTabData);

        result.forEach((data,i) => {
            if(data.isValid){
                this._promosService.postPromo({...allTabData[i],i}).subscribe({
                    next:(response)=>{
                        if(response.success && response.exist){
                            this.onAlertsEvent({title:'Error', message: 'EL codigo de promocion ya existe ingrese uno diferente'});
                        } else if (response.success && response.message === 'Promos created successfully'){
                            this.onAlertsEvent({title:'Exito', message: 'Promociones Guardadas'});
                            this.modal.dismiss();
                        }
                    },
                    error:(err)=>{

                    }
                })
            }
        });
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
            intialDateFCCheckIn: [null, Validators.required], // Add this
            endDateFCCheckIn: [null, Validators.required], // Add this
            intialDateFC: [null, Validators.required], 
            endDateFC: [null, Validators.required],
            desc: [item.desc],
            anticipatedNights: [item.anticipatedNights, [Validators.required, this.qtyNightsValidator.bind(this)]],
            anticipatedNightsmax: [item.anticipatedNightsmax, [Validators.required, this.qtyNightsValidator.bind(this)]],
            payonly: [item.payonly, [Validators.required, this.qtyNightsValidator.bind(this)]],
            stay: [item.stay, [Validators.required, this.qtyNightsValidator.bind(this)]],
            selectedDays: [item.selectedDays]
          });
    
          this.formArray.push(formGroup);
        });

            // Check validity per index
        const validationResults = this.formArray.controls.map((control, index) => ({
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