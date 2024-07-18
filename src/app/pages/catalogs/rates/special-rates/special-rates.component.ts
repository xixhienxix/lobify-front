/* eslint-disable @angular-eslint/no-output-on-prefix */
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup,  Validators } from '@angular/forms';
import { NgbActiveModal, NgbDate,  NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Subscription,  } from 'rxjs';
import { DateTime } from 'luxon';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Tarifas } from 'src/app/models/tarifas';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { VisibilityRates } from 'src/app/models/visibility.model';
import { Politicas } from 'src/app/models/politicas.model';
import { Dias } from 'src/app/models/days.model';
import { Prompt } from 'src/app/models/prompt.model';

type listaCamas = {key:number;value:string;}
@Component({
  selector: 'app-special-rates',
  templateUrl: './special-rates.component.html',
  styleUrls: ['./special-rates.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class SpecialRatesComponent implements OnInit, AfterViewInit{
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
  activa2:boolean=false
  maximoDePersonas:number
  maximoDeNinos:number;
  descuentoNoAplicado=false
  adultos:number=1;
  ninos:number=0
  dehabilitaButtons:boolean=false
  firstRateCheckbox:boolean=false
  nameExist:boolean=false;
  editMode:boolean=false;

  @Input() tarifa: Tarifas;
  @Input() roomsCodesIndexDB:Habitacion[]
  @Output() honRefreshRooms: EventEmitter<boolean> = new EventEmitter();
  @Output() onAlertsEvent : EventEmitter<Prompt> = new EventEmitter();
  @Output() onTarifaSubmit: EventEmitter<Tarifas> = new EventEmitter();
  @Output() onNameAlreadyExist: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('checkbox') private firstCheckbox:MatCheckbox;
  /**CheckBoxes */
  readonly options =signal<Dias[]> ([
      {rateIndex:0, name:'Lun', value:0, checked:false},
      {rateIndex:0, name:'Mar', value:1, checked:false},
      {rateIndex:0, name:'Mie', value:2, checked:false},
      {rateIndex:0, name:'Jue', value:3, checked:false},
      {rateIndex:0, name:'Vie', value:4, checked:false},
      {rateIndex:0, name:'Sab', value:5, checked:false},
      {rateIndex:0, name:'Dom', value:6, checked:false}
    ]);

  readonly options2 =signal<Dias[]> ([
      {rateIndex:0, name:'Lun', value:0, checked:false},
      {rateIndex:0, name:'Mar', value:1, checked:false},
      {rateIndex:0, name:'Mie', value:2, checked:false},
      {rateIndex:0, name:'Jue', value:3, checked:false},
      {rateIndex:0, name:'Vie', value:4, checked:false},
      {rateIndex:0, name:'Sab', value:5, checked:false},
      {rateIndex:0, name:'Dom', value:6, checked:false}
  ]);

  readonly defaultvalues =signal<Dias[]> ([
    {rateIndex:0, name:'Lun', value:0, checked:false},
    {rateIndex:0, name:'Mar', value:1, checked:false},
    {rateIndex:0, name:'Mie', value:2, checked:false},
    {rateIndex:0, name:'Jue', value:3, checked:false},
    {rateIndex:0, name:'Vie', value:4, checked:false},
    {rateIndex:0, name:'Sab', value:5, checked:false},
    {rateIndex:0, name:'Dom', value:6, checked:false}
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

  get tarifasActivasControls() {
    return this.tarifaFormGroup.get('tarifasActivas') as FormArray;
  }

  get tarifaControls (){
    return this.tarifaFormGroup.controls
  }


  
  ngOnInit(): void {

    // this.getTarifasRack();
    if(this.tarifa){
      if(this.tarifa.Estado){
        this.activa=true;
        this.activa2=false;
      }else{
        this.activa=false;
        this.activa2=true;
      }
      this.editMode=true;
      this.options.update(item=>{
          item = this.tarifa.TarifasActivas[0].Dias
        return item
      });

      if(this.tarifa.TarifasActivas.length>1){
        this.options2.update(item=>{
          item = this.tarifa.TarifasActivas[1].Dias
        return item
      });
      }


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

      this.tarifaFormGroup = this.fb.group({
        estado:[this.tarifa.Estado,Validators.required],
        nombre:[this.tarifa.Tarifa,Validators.required], // <-- Here's how you pass in the custom validator.],
        minima:[this.tarifa.EstanciaMinima,Validators.required],
        maxima:[this.tarifa.EstanciaMaxima,Validators.required],
        tarifa_1:[this.tarifa.TarifasActivas[0].Tarifa_1,Validators.required],
        tarifa_2:[this.tarifa.TarifasActivas[0].Tarifa_2,Validators.required],
        tarifa_3:[this.tarifa.TarifasActivas[0].Tarifa_3,Validators.required],
        tarifa_n:[this.tarifa.TarifasActivas[0].Tarifa_N,Validators.required],
        tarifasActivas: this.fb.array([this.createTarifasActivasControls(true)]),
      });

      // this.patch();

    }else{
      this.tarifaFormGroup = this.fb.group({
        estado:[true,Validators.required],
        nombre:['',Validators.required],
        tarifa_1:[0,Validators.required],
        tarifa_2:[0,Validators.required],
        tarifa_3:[0,Validators.required],
        tarifa_n:[0,Validators.required],
        tarifasActivas: this.fb.array([this.createTarifasActivasControls(false)]),
        minima:[1,Validators.required],
        maxima:[0,Validators.required],

      });
    }

    this.getCodigosCuarto();
  }

  ngAfterViewInit(): void {
    if(this.tarifa.TarifasActivas.length < 2){
      this.firstCheckbox.checked = false;
    }
  }

  private createTarifasActivasControls(editMode:boolean): FormGroup {
    if(editMode){
      if(this.tarifa.TarifasActivas.length > 1){
        return new FormGroup({
          'Descripcion': new FormControl(this.tarifa.Tarifa),
          'Activa': new FormControl(this.tarifa.Estado),
          'Tarifa_1': new FormControl(this.tarifa.TarifasActivas[1].Tarifa_1, Validators.required),
          'Tarifa_2': new FormControl(this.tarifa.TarifasActivas[1].Tarifa_2, Validators.required),
          'Tarifa_3': new FormControl(this.tarifa.TarifasActivas[1].Tarifa_3, Validators.required),
          'Tarifa_N': new FormControl(this.tarifa.TarifasActivas[1].Tarifa_N, Validators.required),
          'Dias': new FormControl(this.tarifa.TarifasActivas[1].Dias),
        });
      }else{
        return new FormGroup({
          'Descripcion': new FormControl(''),
          'Activa': new FormControl(false),
          'Tarifa_1': new FormControl(0, Validators.required),
          'Tarifa_2': new FormControl(0, Validators.required),
          'Tarifa_3': new FormControl(0, Validators.required),
          'Tarifa_N': new FormControl(0, Validators.required),
          'Dias': new FormControl(this.options2()),
        });
      }
    }else{
      return new FormGroup({
        'Descripcion': new FormControl(''),
        'Activa': new FormControl(false),
        'Tarifa_1': new FormControl(0, Validators.required),
        'Tarifa_2': new FormControl(0, Validators.required),
        'Tarifa_3': new FormControl(0, Validators.required),
        'Tarifa_N': new FormControl(0, Validators.required),
        'Dias': new FormControl(this.options2()),
      });
    }
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
    let _tarifaRack=[]
    
    if(this.resultLocationCamas.length === 1){
      _tarifaRack = this.tarifaRackArr.filter(filtro=>filtro.Habitacion==this.resultLocationCamas[0])
    }
  }

  onFirstRateCheckbox(checked:MatCheckboxChange){
    this.firstRateCheckbox = checked.checked
  }

  camasValue(selected:any){
    this.resultLocationCamas = this.resultLocationCamas.filter((option) => {
      return option !== selected;
    });
  
  }

  getOption(checked:boolean, index:number){
    this.options.update(item=>{
      if(index !== undefined ){
        item[index].rateIndex = 0
        item[index].checked= checked
      }
      return item
    });

  }

  getOption2(checked:boolean, index:number){
    this.options2.update(item=>{
      if(index !== undefined ){
        item[index].rateIndex = 1
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

    let estado = true;
    if(this.formControls['estado'].value === '2'){
      estado = false;
    }
    
    this.tarifasActivasControls.controls.map((item)=>{
      item.value.Descripcion = this.formControls['nombre'].value.trim();
      item.value.Activa = estado
      item.value.Dias = this.options2()
    });

    const tarifasActivas = [{
      Activa:estado,
      Descripcion:this.formControls['nombre'].value,
      Tarifa_1:this.formControls['tarifa_1'].value,
      Tarifa_2:this.formControls['tarifa_2'].value,
      Tarifa_3:this.formControls['tarifa_3'].value,
      Tarifa_N:this.formControls['tarifa_n'].value,
      Dias:this.options()
    }];

    tarifasActivas.push(this.formControls['tarifasActivas'].value[0]);

    if(this.firstCheckbox.checked === false ){
      tarifasActivas.pop();
    }
      var id  = new Object();
      let reviewedId:any
      if(this.tarifa){
        reviewedId = this.tarifa._id
      }else{
        reviewedId = id
      }


      let tarifa: Tarifas= {
        _id:reviewedId,
        Tarifa:this.formControls["nombre"].value.trim(),
        Habitacion:this.resultLocationCamas,
        Llegada:this.range.controls["start"].value!,
        Salida:this.range.controls["end"].value!,
        Plan:'Ninguno',
        Adultos:1,
        TarifaRack:0,
        Ninos:0,
        Dias:this.defaultvalues(),
        Politicas: this.politicas(),
        Descuento:0,
        EstanciaMinima:this.formControls['minima'].value,
        EstanciaMaxima:this.formControls['maxima'].value,
        Estado:estado,
        TarifasActivas:tarifasActivas,
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

  isErrorState(control: FormControl | null): boolean {
      const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
      const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);
  
      return invalidCtrl || invalidParent;
  }

}
