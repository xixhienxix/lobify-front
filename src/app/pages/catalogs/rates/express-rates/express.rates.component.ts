/* eslint-disable @angular-eslint/no-output-on-prefix */
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectorRef, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatCheckbox } from '@angular/material/checkbox';
import { Tarifas } from 'src/app/models/tarifas';
import { VisibilityRates } from 'src/app/models/visibility.model';
import { Politicas } from 'src/app/models/politicas.model';
import { Dias } from 'src/app/models/days.model';
import { Prompt } from 'src/app/models/prompt.model';

@Component({
  selector: 'app-express-rates',
  templateUrl: './express.rates.component.html',
  styleUrls: ['./express.rates.component.scss']
})
export class ExpressRatesComponent implements OnInit, AfterViewInit{

  constructor(
    private fb: FormBuilder,
    private modal:NgbActiveModal,
    private overlayContainer: OverlayContainer,
    private changeDetector: ChangeDetectorRef
    )
    {}

  tarifa:Tarifas
  tarifatoModify:Tarifas
  preciosFormGroup:FormGroup;

  /** Models */
  tarifasArray:Tarifas[]=[];

  /**DOm */
  dehabilitaButtons:boolean=false;
  tarifaEspecialYVariantes:boolean=false;
  breakfastFlag:boolean=false;
  allIncludedFlag:boolean=false;
  editMode:boolean=true;

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
  @ViewChild('checkbox') private firstCheckBox: MatCheckbox;

  /**Models */
  @Input() cuartosArray:Habitacion[]=[];
  @Output() onPostTarifa: EventEmitter<Tarifas> = new EventEmitter();
  @Output() onAlertsEvent : EventEmitter<Prompt> = new EventEmitter();
  @Output() onNameAlreadyExist: EventEmitter<boolean> = new EventEmitter();
  @Output() onTarifaSubmit: EventEmitter<Tarifas> = new EventEmitter();



  get preciosControls (){
    return this.preciosFormGroup.controls
  }

  get tarifasActivasControls() {
    return this.preciosFormGroup.get('tarifasActivas') as FormArray;
  }

  ngOnInit(){
    this.tarifatoModify =  JSON.parse(JSON.stringify(this.tarifa));

    if(this.tarifatoModify.TarifasActivas.length>0){
      this.visibility.update(item=>{
        item = this.tarifa.Visibilidad
      return item
      });
  
      this.politicas.update(item=>{
          item = this.tarifa.Politicas!
      return item
      });
      this.preciosFormGroup = this.fb.group({
        estado:[this.tarifatoModify.Estado,Validators.required],
        tarifaBase:[{value:this.tarifatoModify.TarifaRack, disabled:true},Validators.required],
        tarifa_1:[0,Validators.required],
        tarifa_2:[0,Validators.required],
        tarifa_3:[0,Validators.required],
        tarifa_n:[0,Validators.required],
        tarifasActivas: this.fb.array([]),
        minima:[1,Validators.required],
        maxima:[0,Validators.required],
      });
    }else{
      this.preciosFormGroup = this.fb.group({
        estado:[true,Validators.required],
        tarifaBase:[{value:this.tarifatoModify.TarifaRack, disabled:false},Validators.required],
        tarifa_1:[0,Validators.required],
        tarifa_2:[0,Validators.required],
        tarifa_3:[0,Validators.required],
        tarifa_n:[0,Validators.required],
        tarifasActivas: this.fb.array([]),
        minima:[1,Validators.required],
        maxima:[0,Validators.required],
      });
      //this.addTarifaActiva();
    }
  }
  ngAfterViewInit() {
    if(this.tarifatoModify.TarifasActivas.length>0){
      this.tarifasActivasInitialize();
      this.firstCheckBox.checked=true;
    }
    this.editMode=true;
    this.changeDetector.detectChanges();
  }

  tarifasActivasInitialize(){
    this.politicas.update((item:any)=>{
      return item
    });

    const control = <FormArray>this.preciosFormGroup.controls["tarifasActivas"];

    for(let i=0; i<this.tarifatoModify.TarifasActivas.length; i++){
      if(i===(this.tarifatoModify.TarifasActivas.length-1)){
        control.push(new FormGroup({
          'Descripcion': new FormControl(this.tarifatoModify.TarifasActivas[i].Descripcion),
          'Activa': new FormControl(this.tarifatoModify.TarifasActivas[i].Activa),
          'Tarifa_1': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_1, Validators.required),
          'Tarifa_2': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_2, Validators.required),
          'Tarifa_3': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_3, Validators.required),
          'Tarifa_N': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_N, Validators.required),
          'Dias': new FormControl(this.tarifatoModify.TarifasActivas[i].Dias),
        }));
      }else{
        control.push(new FormGroup({
          'Descripcion': new FormControl(this.tarifatoModify.TarifasActivas[i].Descripcion),
          'Activa': new FormControl(this.tarifatoModify.TarifasActivas[i].Activa),
          'Tarifa_1': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_1, Validators.required),
          'Tarifa_2': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_2, Validators.required),
          'Tarifa_3': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_3, Validators.required),
          'Tarifa_N': new FormControl(this.tarifatoModify.TarifasActivas[i].Tarifa_N, Validators.required),
          'Dias': new FormControl(this.tarifatoModify.TarifasActivas[i].Dias),
        }));
      }
    }

  }

  private createTarifasActivasControls(): FormGroup {
    const lenght = this.preciosFormGroup.controls["tarifasActivas"].value.lenght
        const options = signal<Dias[]> ([      
          {rateIndex:lenght, name:'Lun', value:0, checked:true},
          {rateIndex:lenght, name:'Mar', value:1, checked:true},
          {rateIndex:lenght, name:'Mie', value:2, checked:true},
          {rateIndex:lenght, name:'Jue', value:3, checked:true},
          {rateIndex:lenght, name:'Vie', value:4, checked:true},
          {rateIndex:lenght, name:'Sab', value:5, checked:true},
          {rateIndex:lenght, name:'Dom', value:6, checked:true}]);

      return new FormGroup({
        'Descripcion': new FormControl(''),
        'Activa': new FormControl(false),
        'Tarifa_1': new FormControl(0, Validators.required),
        'Tarifa_2': new FormControl(0, Validators.required),
        'Tarifa_3': new FormControl(0, Validators.required),
        'Tarifa_N': new FormControl(0, Validators.required),
        'Dias': new FormControl(options()),
      });
  }

  onDisableBaseRate(checked:boolean){
    if(this.tarifatoModify.TarifasActivas.length === 0){
      if(checked){
        this.addTarifaActiva();
      }
    }else if(!checked){
      this.removeTarifaActiva(0);
    }
    if(!checked){
      this.preciosFormGroup.get('tarifaBase')?.enable();
    }else{
      this.preciosFormGroup.get('tarifaBase')?.disable();
    }

  }

  onNewRate(checked:boolean,index:number){
    if(checked){
      this.addTarifaActiva();
    }else{
      this.removeTarifaActiva(index+1);
    }
  }

  addTarifaActiva() {
    const control = <FormArray>this.preciosFormGroup.controls["tarifasActivas"];
    control.push(this.createTarifasActivasControls());
  }

  removeTarifaActiva(index: number) {
    const control = <FormArray>this.preciosFormGroup.controls["tarifasActivas"];
    if(index in this.tarifatoModify.TarifasActivas){
      this.tarifatoModify.TarifasActivas.splice(index,1);
      this.tarifasActivasControls.clear();
      this.tarifasActivasInitialize();
    }else{
      control.removeAt(index);
    }
        
  }

  setPoliticas(checked:boolean, index:number){
    this.politicas.update(item=>{
        if(index!== undefined){
          item.forEach((item,index2)=>{
            if(index2 === index){
              item.value = checked;
            }else{
              item.value = false;
            }
          })
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

  onSubmit(){

    if(this.preciosFormGroup.invalid){
      this.onAlertsEvent.emit({title:'Advertencia',message:'Faltan Datos por Capturar'})
    }
    else{

      this.preciosFormGroup.controls.tarifasActivas.value.map((item:any)=>{
        item.Activa = true;
        item.Descripcion = this.tarifatoModify.Tarifa;
        item.Dias.forEach((item2:Dias)=>{
          item2.checked = true
        });
      });

        let tarifa: Tarifas= {
          _id:this.tarifa._id,
          Tarifa:this.tarifatoModify.Tarifa,
          Habitacion:this.tarifatoModify.Habitacion,
          Llegada:this.tarifatoModify.Llegada,
          Salida:this.tarifatoModify.Salida,
          Plan:'Ninguno',
          Adultos:this.tarifatoModify.Adultos,
          TarifaRack:this.preciosFormGroup.controls.tarifaBase.value,
          Ninos:this.tarifatoModify.Ninos,
          Dias:this.tarifatoModify.Dias,
          Politicas: this.politicas(),
          Descuento:0,
          EstanciaMinima:this.tarifatoModify.EstanciaMinima,
          EstanciaMaxima:this.tarifatoModify.EstanciaMaxima,
          Estado:this.tarifatoModify.Estado,
          TarifasActivas:this.preciosFormGroup.controls.tarifasActivas.value,
          Visibilidad:this.visibility(),
          Cancelacion:this.politicas(),
        }
  
        this.onTarifaSubmit.emit(tarifa);
  
      }
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
