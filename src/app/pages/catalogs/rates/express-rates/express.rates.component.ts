import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ModalDismissReasons, NgbActiveModal, NgbDate, NgbDateStruct, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTime } from 'luxon';
import { Subscription, map } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Politicas } from 'src/app/models/politicas.model';
import { Tarifas } from 'src/app/models/tarifas';
import { VisibilityRates } from 'src/app/models/visibility.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
type listaCamas = {key:number;value:string;}

@Component({
  selector: 'app-express-rates',
  templateUrl: './express.rates.component.html',
  styleUrls: ['./express.rates.component.scss']
})
export class ExpressRatesComponent implements OnInit{

  /**CheckBoxes */
  options = [
    {name:'Lun', value:0, checked:false},
    {name:'Mar', value:1, checked:false},
    {name:'Mie', value:2, checked:false},
    {name:'Jue', value:3, checked:false},
    {name:'Vie', value:4, checked:false},
    {name:'Sab', value:5, checked:false},
    {name:'Dom', value:6, checked:false}
  ]
  gratis:boolean=false
  sinRembolso:boolean=false

  /**DATES */
  today: DateTime | NgbDateStruct;
  fromDate: DateTime;
  fechaInicial:string
  comparadorInicial:Date
  tomorrow: DateTime | NgbDateStruct;
  toDate: DateTime;
  fechaFinal:string
  comparadorFinal:Date
  
  /**FormGroup */
  tarifaFormGroup:FormGroup
  preciosFormGroup:FormGroup
  camasFC:any
  precios:any


  /**Models & Arrays */
  codigoCuarto:Habitacion[]=[]
  tipodeCaurto:string;
  resultLocationCamas = []
  disponiblesIndexadosCamas:listaCamas[]=[]
  cuartosArray:Habitacion[]=[]
  numbers:any;
  tarifas = []

  /**Variables */
  closeResult:string
  plan:string="No Aplica"
  camaFCVacio:boolean=false
  maximoDePersonas:number

  /**DOM */
  tarifaEspecialYVariantes:boolean=false

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
  readonly visibility = signal<VisibilityRates>({
    name: 'Visibility Rates',
    value: true,
    subTask: [
      { name: 'Recepción', value: true },
      { name: 'Booking', value:false },
      { name: 'Channel Manager OTAs', value: false  }
    ]
  });

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
  
  /**Subscription */
  subscription:Subscription[]=[]

  constructor(
    public modal:NgbActiveModal,
    public habitacionService:HabitacionesService,
    public fb:FormBuilder,
    public i18n: NgbDatepickerI18n,
    public tarifasService:TarifasService,
    public modalService:NgbModal,
  ){
    this.toDate = this.toDate.plus({ days: 1 });
    this.fechaInicial=this.fromDate.day+" de "+this.i18n.getMonthFullName(this.fromDate.month)+" del "+this.fromDate.year
    this.fechaFinal=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year
  }

   /**Getters */
   get formControls (){
    return this.tarifaFormGroup.controls
  }
  get tipoCuarto() 
  { 
    return this.tarifaFormGroup.get('tipoCuarto') 
  }
  get selectedOptions() { // right now: ['1','3']
    return this.options
              .filter(opt => opt.checked)
              .map(opt => opt.value)
  }

  get f(){
    return this.tarifaFormGroup.controls;
  }


  ngOnInit(): void {
    this.tarifaFormGroup = this.fb.group({
      tarifaRack:[0,Validators.required],
      minima:[1,Validators.required],
      maxima:[0,Validators.required],
    })
    this.preciosFormGroup = this.fb.group({
      precios: this.fb.array([])
    })

    this.getHabitaciones();
    //this.getCodigosCuarto();
  }

  getHabitaciones(){
    const sb = this.habitacionService.getAll().subscribe(
      (res)=>{
        this.cuartosArray=res
      },
      (error)=>{

      })
  }

  //Date Helpers
  // getCodigosCuarto()
  // {
  //   this.codigoCuarto=[]
  //   const sb = this.habitacionService.getCodigohabitaciones()
  //   .pipe(map(
  //     (responseData: { [x: string]: any; hasOwnProperty: (arg0: string) => any; })=>{
  //       const postArray = []
  //       for(const key in responseData)
  //       {
  //         if(responseData.hasOwnProperty(key))
  //         postArray.push(responseData[key]);
  //       }
  //       return postArray
  //     }))
  //     .subscribe((codigoCuarto: string | any[])=>{
  //       this.codigoCuarto=(codigoCuarto)
  //       for(let i=0;i<codigoCuarto.length;i++){
  //         this.disponiblesIndexadosCamas.push({key:i,value:codigoCuarto[i]})
  //       }
  //     })
  //     this.subscription.push(sb)
  // }

  getOption(option:any,event:MatCheckboxChange){
    if(event.checked==true){
        for(let i=0; i<this.options.length;i++){
         if(this.options[i].name==option.name){
          this.options[i].checked=true
         }
        }
    }
    
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.tarifaFormGroup.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
  }

  planSeleccionado(event:any){
    this.plan=event.value[0]
  }

  tarifaEspecial(event:MatCheckboxChange){
    if(!event.checked){
      this.precios.clear();
    }else{

      var cuartosFiltrados:Habitacion[]=[];
      let filtro:any
  
      for(let j=0;j<this.resultLocationCamas.length;j++){
  
         filtro = this.cuartosArray.find(object => {
          return object.Codigo == this.resultLocationCamas[j];
        });
        
        cuartosFiltrados.push(filtro)
  
  
      }
  
      if(cuartosFiltrados.length==0){
        this.maximoDePersonas=cuartosFiltrados[0].Adultos
      }else{
        this.maximoDePersonas= Math.max(...cuartosFiltrados.map(o => o.Adultos))
        
      }
      this.numbers = Array(this.maximoDePersonas);
      this.numbers = this.numbers.fill().map((x: any,i: any)=>i)
  
      for(let e=0; e<this.numbers.length;e++){
        this.precios.push(new FormControl(''));
      }
  
      if(event.checked){
        this.tarifaEspecialYVariantes=true
      }else
      {
        this.tarifaEspecialYVariantes=false
      }
  
    }

  }

  onSubmit(){


    // let fromDate = this.fromDate.day+"/"+this.fromDate.month+"/"+this.fromDate.year
    // let toDate = this.toDate.day+"/"+this.toDate.month+"/"+this.toDate.year


    if(this.resultLocationCamas.length==0){
      this.camaFCVacio=true
      return
    }

    let tarifa :Tarifas= {
      Tarifa:'Tarifa Estandar',
      Habitacion:this.resultLocationCamas,
      Llegada:new Date(),
      Salida:new Date(),
      Plan:this.plan,
      Politicas: this.politicas(),
      EstanciaMinima:this.formControls['minima'].value,
      EstanciaMaxima:this.formControls['maxima'].value,
      Estado:true,
      TarifaRack:this.formControls['tarifaRack'].value,
      TarifaXAdulto:this.precios.value,
      TarifaXNino:this.precios.value,
      Dias:this.options,
      Adultos:1,
      Ninos:0,
      Descuento:0,
      Tarifa_Especial_1: {
        Activa:false,
        Descripcion:'',
        Tarifa_1:0,
        Tarifa_2:0,
        Tarifa_3:0,
        Tarifa_N:0,
        Dias:[
        {
          name: '',
          value: 0,
          checked: false,
        }
      ]
    },Tarifa_Especial_2: {
      Activa:false,
      Descripcion:'',
      Tarifa_1:0,
      Tarifa_2:0,
      Tarifa_3:0,
      Tarifa_N:0,
      Dias:[
        {
          name: '',
          value: 0,
          checked: false,
        }
      ]
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

    this.tarifasService.postTarifa(tarifa).subscribe(
      (value)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Tarifa(s) Generada(s) con éxito'          
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.tarifasService.sendNotification(true)
          this.modal.close();
          
      },
      (error)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje='No se pudo guardar la tarifa intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
      })
  }

  fechaSeleccionadaInicial(event:NgbDate){

    this.fromDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})
  
    this.comparadorInicial = new Date(event.year,event.month-1,event.day)
  
    this.fechaInicial= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  }

  fechaSeleccionadaFinal(event:NgbDate){

    this.toDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})

    this.comparadorFinal = new Date(event.year,event.month-1,event.day)

    this.fechaFinal= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  }

  camasValue(selected:any){
    this.resultLocationCamas = this.resultLocationCamas.filter((option) => {
      return option !== selected;
    });
  
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
}
