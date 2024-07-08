/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnInit, Output, signal, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal, NgbDate, NgbDateStruct, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Subject, Subscription, map, takeUntil } from 'rxjs';
import { DateTime } from 'luxon';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Tarifas } from 'src/app/models/tarifas';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { MatRadioChange } from '@angular/material/radio';
import { VisibilityRates } from 'src/app/models/visibility.model';
import { Politicas } from 'src/app/models/politicas.model';
import { Dias } from 'src/app/models/days.model';
import { Prompt } from 'src/app/models/prompt.model';
import { nameAlreadyExist } from 'src/app/_metronic/shared/customValidators/name-already-exist.directive';

type listaCamas = {key:number;value:string;}
@Component({
  selector: 'app-special-rates',
  templateUrl: './special-rates.component.html',
  styleUrls: ['./special-rates.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class SpecialRatesComponent implements OnInit{
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  gratis:boolean=false
  sinRembolso:boolean=false

  /**DATES */
  fromDate: DateTime;
  fechaInicial:string
  comparadorInicial:Date
  toDate: DateTime;
  fechaFinal:string
  comparadorFinal:Date
  
  /**FormGroup */
  tarifaFormGroup:FormGroup
  camasFC = new FormControl();
  precios: FormArray = new FormArray<any>([]);
  preciosNinos= new FormArray<any>([]);
  preciosFormGroup:FormGroup;

  /**Models & Arrays */
  codigoCuarto:Habitacion[]=[]
  resultLocationCamas:string[] = []
  disponiblesIndexadosCamas:listaCamas[]=[]
  tarifaRackArr:any[]=[]
  cuartosArray:Habitacion[]=[]
  numbers:any
  numbersNinos:any
  tarifasArray:Tarifas[]=[]

  /**Variables */
  closeResult:string
  camaFCVacio:boolean=false
  tarifaEspecialYVariantes:boolean=false
  descuentoTotalProCheckbox:boolean=false
  activa:boolean=true
  maximoDePersonas:number
  maximoDeNinos:number;
  descuentoNoAplicado=false
  adultos:number=1;
  ninos:number=0
  dehabilitaButtons:boolean=false
  firstRateCheckbox:boolean=false
  tarifaVariante:boolean=false;
  nameExist:boolean=false;

  @Input() tarifa: Tarifas;
  @Input() roomsCodesIndexDB:Habitacion[]
  @Output() honRefreshRooms: EventEmitter<boolean> = new EventEmitter();
  @Output() onAlertsEvent : EventEmitter<Prompt> = new EventEmitter();
  @Output() onTarifaSubmit: EventEmitter<Tarifas> = new EventEmitter();
  @Output() onNameAlreadyExist: EventEmitter<boolean> = new EventEmitter();
    /**CheckBoxes */
  readonly options =signal<Dias[]> ([
      {name:'Lun', value:0, checked:false},
      {name:'Mar', value:1, checked:false},
      {name:'Mie', value:2, checked:false},
      {name:'Jue', value:3, checked:false},
      {name:'Vie', value:4, checked:false},
      {name:'Sab', value:5, checked:false},
      {name:'Dom', value:6, checked:false}
    ]);
    
  readonly options2 = signal<Dias[]>([
      {name:'Lun', value:0, checked:false},
      {name:'Mar', value:1, checked:false},
      {name:'Mie', value:2, checked:false},
      {name:'Jue', value:3, checked:false},
      {name:'Vie', value:4, checked:false},
      {name:'Sab', value:5, checked:false},
      {name:'Dom', value:6, checked:false}
    ]);

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

  /**Subscription */
  subscription:Subscription[]=[]
  
  constructor(
    public modal:NgbActiveModal,
    public _habitacionService:HabitacionesService,
    public fb:FormBuilder,
    public i18n: NgbDatepickerI18n,
    public tarifasService:TarifasService,
    public modalService:NgbModal,
    private overlayContainer: OverlayContainer
  ) {}

   get formControls (){
    return this.tarifaFormGroup.controls
  }

  get tipoCuarto() 
  { 
    return this.tarifaFormGroup.get('tipoCuarto') 
  }

  // get selectedOptions() { // right now: ['1','3']
  //   return this.options
  //             .filter(opt => opt.checked)
  //             .map(opt => opt.value)
  // }

  get tarifaControls (){
    return this.tarifaFormGroup.controls
  }

  
  ngOnInit(): void {

    // this.getTarifasRack();
    if(this.tarifa){
      this.tarifaFormGroup = this.fb.group({
        estado:[this.tarifa.Estado,Validators.required],
        nombre:[this.tarifa.Tarifa,Validators.required], // <-- Here's how you pass in the custom validator.],
        tarifaBase:[this.tarifa.TarifaRack,Validators.required],
        tarifa1persona:[this.tarifa.Tarifa_Especial_1.Tarifa_1,Validators.required],
        tarifa2persona:[this.tarifa.Tarifa_Especial_1.Tarifa_2,Validators.required],
        tarifa3persona:[this.tarifa.Tarifa_Especial_1.Tarifa_3,Validators.required],
        tarifaNinos:[this.tarifa.Tarifa_Especial_1.Tarifa_N,Validators.required],
        tarifaBase2:[this.tarifa.TarifaRack,Validators.required],
        tarifa1persona2:[this.tarifa.Tarifa_Especial_2.Tarifa_1,Validators.required],
        tarifa2persona2:[this.tarifa.Tarifa_Especial_2.Tarifa_2,Validators.required],
        tarifa3persona2:[this.tarifa.Tarifa_Especial_2.Tarifa_3,Validators.required],
        tarifaNinos2:[this.tarifa.TarifaRack,Validators.required],
        minima:[this.tarifa.EstanciaMinima,Validators.required],
        maxima:[this.tarifa.EstanciaMaxima,Validators.required],
      });

      this.options.update(item=>{
          item = this.tarifa.Tarifa_Especial_1.Dias
        return item
      });
      this.options2.update(item=>{
        item = this.tarifa.Tarifa_Especial_2.Dias
      return item
    });

    this.firstRateCheckbox = this.tarifa.Tarifa_Especial_2.Activa;

    this.range.controls["start"].patchValue(new Date(this.tarifa.Llegada));
    this.range.controls["end"].patchValue(new Date(this.tarifa.Salida));
    this.resultLocationCamas = this.tarifa.Habitacion


    this.visibility.update(item=>{
      item = this.tarifa.Visibilidad
    return item
    });

    this.politicas.update(item=>{
        item = this.tarifa.Politicas!
    return item
    });

    if(this.tarifa.Tarifa_Especial_1.Activa){
      this.tarifasVariantes(true);
      this.tarifaVariante=true;
    }

    }else{
      this.tarifaFormGroup = this.fb.group({
        estado:[true,Validators.required],
        nombre:['',Validators.required],
        tarifaBase:[0,Validators.required],
        tarifa1persona:[0,Validators.required],
        tarifa2persona:[0,Validators.required],
        tarifa3persona:[0,Validators.required],
        tarifaNinos:[0,Validators.required],
        tarifaBase2:[0,Validators.required],
        tarifa1persona2:[0,Validators.required],
        tarifa2persona2:[0,Validators.required],
        tarifa3persona2:[0,Validators.required],
        tarifaNinos2:[0,Validators.required],
        minima:[1,Validators.required],
        maxima:[0,Validators.required],
      });
    }

    this.getCodigosCuarto();
  }


  preventCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.add('disable-backdrop-click');
  }

  allowCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.remove('disable-backdrop-click');
  }

  //Date Helpers
  getCodigosCuarto(){
    this.codigoCuarto = this.cuartosArray.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.Codigo === value.Codigo
      )))
    for(let i=0;i<this.codigoCuarto.length;i++){
      this.disponiblesIndexadosCamas.push({key:i,value:this.codigoCuarto[i].Codigo})
    }
  }


  fechaSeleccionadaInicial(event:NgbDate){
    this.fromDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year});
    this.comparadorInicial = new Date(event.year,event.month-1,event.day);
    this.fechaInicial= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year;
  }

  fechaSeleccionadaFinal(event:NgbDate){
    this.toDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})
    this.comparadorFinal = new Date(event.year,event.month-1,event.day)
    this.fechaFinal= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  }

  selectionChange(){
    let tarifaRack

    if(this.resultLocationCamas.length === 1){
      tarifaRack = this.tarifaRackArr.filter(filtro=>filtro.Habitacion==this.resultLocationCamas[0])
    }
  }

  onFirstRateCheckbox(checked:MatCheckboxChange){
    this.firstRateCheckbox = checked.checked
  }

  tarifasVariantes(checked:boolean){
    if(!checked){
      this.tarifaFormGroup.get('tarifaBase')?.enable();
      this.tarifaVariante=false;
    }else{
      this.tarifaFormGroup.get('tarifaBase')?.disable();
      this.tarifaVariante=true;
    }
  }

  camasValue(selected:any){
    this.resultLocationCamas = this.resultLocationCamas.filter((option) => {
      return option !== selected;
    });
  
  }

  getOption(checked:boolean, index:number){
    this.options.update(item=>{
      if(index !== undefined ){
        item[index].checked= checked
      }
      return item
    });

  }

  getOption2(checked:boolean, index:number){
    this.options2.update(item=>{
      if(index !== undefined ){
        item[index].checked= checked
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

  onSubmit(){
    const rateName = this.formControls["nombre"].value.trim(); 
    const checkRateName = this.tarifasArray.filter((item) => item.Tarifa === rateName );

    if(this.tarifaFormGroup.invalid){
      this.onAlertsEvent.emit({title:'Advertencia',message:'Faltan Datos por Capturar'})
    }else if(checkRateName.length !== 0){
      this.onNameAlreadyExist.emit(true);
    }
    else{

    if(this.resultLocationCamas.length==0){
      this.camaFCVacio=true
      return
    }

      let tarifa :Tarifas= {
        Tarifa:this.formControls["nombre"].value.trim(),
        Habitacion:this.resultLocationCamas,
        Llegada:this.range.controls["start"].value!,
        Salida:this.range.controls["end"].value!,
        Plan:'Ninguno',
        Adultos:1,
        TarifaRack:this.formControls["tarifaBase"].value,
        Ninos:0,
        Politicas: this.politicas(),
        EstanciaMinima:this.formControls['minima'].value,
        EstanciaMaxima:this.formControls['maxima'].value,
        Estado:this.formControls['estado'].value,
        Tarifa_Especial_1: {
          Activa:this.tarifaVariante,
          Descripcion:'Solo Hospedaje',
          Tarifa_1:this.formControls['tarifa1persona'].value,
          Tarifa_2:this.formControls['tarifa2persona'].value,
          Tarifa_3:this.formControls['tarifa3persona'].value,
          Tarifa_N:this.formControls['tarifaNinos'].value,
          Dias:this.options()
        },
        Tarifa_Especial_2: {
          Activa:this.firstRateCheckbox,
          Descripcion:'Solo Hospedaje',
          Tarifa_1:this.formControls['tarifa1persona2'].value,
          Tarifa_2:this.formControls['tarifa2persona2'].value,
          Tarifa_3:this.formControls['tarifa3persona2'].value,
          Tarifa_N:this.formControls['tarifaNinos2'].value,
          Dias:this.options2()
        },
          Tarifa_Sin_Variantes: {
            Activa:true,
            Descripcion:'Solo Hospedaje',
            Tarifa_1:0,
            Tarifa_2:0,
            Tarifa_3:0,
            Tarifa_N:0
        },
        Tarifa_Extra_Sin: {
            Activa:false,
            Descripcion:'Desayunos Incluidos',
            Tarifa_1:0,
            Tarifa_2:0,
            Tarifa_3:0,
            Tarifa_N:0
        },
        Tarifa_Extra_Con: {
            Activa:false,
            Descripcion:'Todo Incluido',
            Tarifa_1:0,
            Tarifa_2:0,
            Tarifa_3:0,
            Tarifa_N:0
        },
        Visibilidad:this.visibility(),
        Cancelacion:this.politicas(),
      }

      this.onTarifaSubmit.emit(tarifa);

    }
  }

  
  closeModal(){
    this.modal.close();
  }

  /*FORM HELPERS*/
  isControlValid(controlName: string): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation: string, controlName: string | number): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName: string | number): boolean {
    const control = this.tarifaFormGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
      const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);
  
      return invalidCtrl || invalidParent;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
  }
}
