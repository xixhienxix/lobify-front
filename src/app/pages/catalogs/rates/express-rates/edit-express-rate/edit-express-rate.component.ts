/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { Tarifas } from 'src/app/models/tarifas';
import { VisibilityRates } from 'src/app/models/visibility.model';
import { Politicas } from 'src/app/models/politicas.model';

@Component({
  selector: 'app-edit-express-rate',
  templateUrl: './edit-express-rate.component.html',
  styleUrls: ['./edit-express-rate.component.scss'],
})
export class EditExpressRateComponent implements OnInit{
  tarifa:Tarifas
  preciosFormGroup:FormGroup;

  /**DOm */
  dehabilitaButtons:boolean=false;
  tarifaEspecialYVariantes:boolean=false;
  breakfastFlag:boolean=false;
  allIncludedFlag:boolean=false;

  readonly visibility = signal<VisibilityRates>({
    name: 'Visibility Rates',
    value: true,
    subTask: [
      { name: 'Recepción', value: true },
      { name: 'Booking', value:false },
      { name: 'Channel Manager OTAs', value: false  }
    ]
  });
    readonly politicas = signal<Politicas[]>([{
      name:'Gratis',
      value:true
    },{
      name:'No Reembolsable',
      value: false
    },{
      name:'Reembolsable Parcial',
      value: false
    }
  ]);

  /**Models */
  @Input() cuartosArray:Habitacion[]=[];
  @Output() honRefreshRooms: EventEmitter<boolean> = new EventEmitter();
  @Output() onPostTarifa: EventEmitter<Tarifas> = new EventEmitter();

  /**FLags */
  activa:boolean=true

  get preciosControls (){
    return this.preciosFormGroup.controls
  }

  constructor(
    private fb: FormBuilder,
    private modal:NgbActiveModal,
    private overlayContainer: OverlayContainer
    )
    {
    }
  
  ngOnInit(){
    this.preciosFormGroup = this.fb.group({
      tarifaBase:[this.tarifa.TarifaRack,Validators.required],
      tarifa1personaSin:[this.tarifa.Tarifa_Sin_Variantes.Tarifa_1,Validators.required],
      tarifa2personaSin:[this.tarifa.Tarifa_Sin_Variantes.Tarifa_2,Validators.required],
      tarifa3personaSin:[this.tarifa.Tarifa_Sin_Variantes.Tarifa_3,Validators.required],
      tarifaNinosSin:[this.tarifa.Tarifa_Sin_Variantes.Tarifa_N,Validators.required],
      tarifa1personaBreak:[this.tarifa.Tarifa_Extra_Sin.Tarifa_1,Validators.required],
      tarifa2personaBreak:[this.tarifa.Tarifa_Extra_Sin.Tarifa_2,Validators.required],
      tarifa3personaBreak:[this.tarifa.Tarifa_Extra_Sin.Tarifa_3,Validators.required],
      tarifaNinosBreak:[this.tarifa.Tarifa_Extra_Sin.Tarifa_N,Validators.required],
      tarifa1personaAll:[this.tarifa.Tarifa_Extra_Con.Tarifa_1,Validators.required],
      tarifa2personaAll:[this.tarifa.Tarifa_Extra_Con.Tarifa_2,Validators.required],
      tarifa3personaAll:[this.tarifa.Tarifa_Extra_Con.Tarifa_3,Validators.required],
      tarifaNinosAll:[this.tarifa.Tarifa_Extra_Con.Tarifa_N,Validators.required],
      visible:[true,Validators.required],
      cancelationPolicy:[true,Validators.required]
    });

    this.allIncludedFlag = this.tarifa.Tarifa_Extra_Con.Activa;
    this.breakfastFlag = this.tarifa.Tarifa_Extra_Sin.Activa
  }

  async getHabitaciones(refreshTable:boolean){

    if(refreshTable){
      this.honRefreshRooms.emit(true);
    }
  }

  ratesBreakFastChecked(checked:MatCheckboxChange){
    this.breakfastFlag=checked.checked;
    
  }

  allIncludedRatesCheckbox(checked:MatCheckboxChange){
    this.allIncludedFlag=checked.checked;
    
  }

  onSubmit(){

    if(this.preciosFormGroup.valid){
      this.save();
    }else if(this.preciosFormGroup.invalid)
    {
      this.findInvalidControlsRecursive(this.preciosFormGroup);
    }
  }

  save(){
    const postTarifas:Tarifas = {
      ...this.tarifa,
      Tarifa_Sin_Variantes: {
          Activa:true,
          Descripcion:'Solo Hospedaje',
          Tarifa_1:this.preciosFormGroup.controls['tarifa1personaSin'].value,
          Tarifa_2:this.preciosFormGroup.controls['tarifa2personaSin'].value,
          Tarifa_3:this.preciosFormGroup.controls['tarifa3personaSin'].value,
          Tarifa_N:this.preciosFormGroup.controls['tarifaNinosSin'].value
      },
      Tarifa_Extra_Sin: {
          Activa:this.breakfastFlag,
          Descripcion:'Desayunos Incluidos',
          Tarifa_1:this.preciosFormGroup.controls['tarifa1personaBreak'].value,
          Tarifa_2:this.preciosFormGroup.controls['tarifa2personaBreak'].value,
          Tarifa_3:this.preciosFormGroup.controls['tarifa3personaBreak'].value,
          Tarifa_N:this.preciosFormGroup.controls['tarifaNinosBreak'].value
      },
      Tarifa_Extra_Con: {
          Activa:this.allIncludedFlag,
          Descripcion:'Todo Incluido',
          Tarifa_1:this.preciosFormGroup.controls['tarifa1personaAll'].value,
          Tarifa_2:this.preciosFormGroup.controls['tarifa2personaAll'].value,
          Tarifa_3:this.preciosFormGroup.controls['tarifa3personaAll'].value,
          Tarifa_N:this.preciosFormGroup.controls['tarifaNinosAll'].value
      },
      Visibilidad:this.visibility(),
      Cancelacion:this.politicas(),  
    }
    this.onPostTarifa.emit(postTarifas);
    this.closeModal();
  }

  public findInvalidControlsRecursive(formToInvestigate:FormGroup):string[] {
    var invalidControls:string[] = [];
    let recursiveFunc = (form:FormGroup) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control?.invalid) invalidControls.push(field);
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }

  setPoliticas(checked:boolean, index:number){
    this.politicas.update(item=>{
        if(index!== undefined){
          item.forEach(item=>{
            item.value = false;
          })
          item[index].value = checked;
        }
      return item
    });
  }

  updateVisibilityArray(checked:boolean, index?:number){
    this.visibility.update(task =>{
      if(index !== undefined){
        task.subTask![index].value = checked;
      }
      return {...task}
    });
}

  preventCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.add('disable-backdrop-click');
  }

  allowCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.remove('disable-backdrop-click');
  }

  closeModal(){
    this.modal.close();
  }

}
