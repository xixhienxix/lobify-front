import { AfterContentChecked, AfterContentInit, AfterViewChecked, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray, FormGroupDirective, NgForm } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, concat, concatMap, filter, map, takeUntil } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Adicional } from 'src/app/models/adicional.model';
import { Disponibilidad } from 'src/app/models/disponibilidad.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { DateTime } from 'luxon'
import { CodigosService } from 'src/app/services/codigos.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { Tarifas } from 'src/app/models/tarifas';
import { Codigos } from 'src/app/models/codigos.model';

type listaAmenidades = {key:number;value:string}
type listaCamas = {key:number;value:string;cantidad:number}

export class FileUpload {
  key: string;
  name: string;
  url: string;
  file: File;

  constructor(file: File) {
    this.file = file;
  }
}
@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class NewRoomComponent implements OnInit, OnDestroy{

  @ViewChild('itemSelect') public itemSelect: MatSelect;
  @ViewChild('matOption') public matOption: MatOption;
  /**Modal */
  closeResult:string
  habitacion:Habitacion;

  /**FormControl */
  formGroup:FormGroup
  amenidadesFC = new FormControl();
  camasFC = new FormControl();
  serviciosAdicionales=new FormControl();
  inputForm:FormGroup;

  /*MODELS*/
  tiposArr:Codigos[]=[]
  amenidadesArr:Codigos[]=[]
  camasArr:Codigos[]=[]
  disponiblesIndexados:listaAmenidades[]=[]
  disponiblesIndexadosCamas:listaCamas[]=[]
  disponibilidadNuevaGeneral:Disponibilidad[]=[]
  resultLocation:string[] =[]
  resultLocationCamas:string[] = []
  resultAdicionales = []
  adicionalesArr:Adicional[]=[]
  // camasArr:Adicional[]=[]
  // inventarioArr:number[]=[1]
  nombreHabs:string[]=[]

  /**DateTime */
  toDate: DateTime;
  fromDate:DateTime

  /*DOM*/
  loadingAdicionales:boolean=true
  checkBox:boolean=false
  nombresIguales:boolean=false
  edicion:boolean=false
  inicio:boolean=true
  editarHab:boolean=false
  isLoading:boolean=false
  reload:boolean=false

  /**FLAGS DE Generacion */
  habitacionGenerada:boolean = false
  tarifaGenerada:boolean = false
  disponibilidadGenerada:boolean = false
  mensajeDeHabitacionGenerada:string=''
  mensajeDeTarifaGenerada:string=''
  mensajeDeDisponibilidadGenerada:string=''


  //VALORES DEFAULT
  quantity:number=1;
  quantityExtra:number=0;
  quantityInv:number=1;
  quantityExtraInv:number=0;

  //File Upload
  sendUpload: boolean;
  imagen:any;
  imageSelected:boolean=false


  /**Subscription */
  private ngUnsubscribe = new Subject<void>();
  subscriptions:Subscription[]=[]

  constructor(
    public fb : FormBuilder,
    public _codigosService : CodigosService,
    public modalService : NgbModal,
    public habitacionService:HabitacionesService,
    public router : Router,
    public modal:NgbActiveModal,
    public _tarifasService:TarifasService,
    public _parametrosService:ParametrosService,
    private af :AngularFireStorage


  ) {

  }

  ngOnInit(): void {
  this.getCodigos(false);
  // this.checkEdicion();

    this.formGroup = this.fb.group({
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      tipo: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      descripcion: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1000)])],
      adultos: [1, Validators.compose([Validators.required,Validators.min(1)])],
      ninos: [0, Validators.required],
      vista: [''],
      inventario: [1, Validators.required],
      orden:[1,Validators.required],
      nombreHabs: this.fb.array([]),
      tarifaBase:[0,Validators.required],
      etiqueta:[0,Validators.required],
    })

    this.inputForm = this.fb.group({
      nombreHabs: ['',],
    });

    if(this.habitacion!=undefined){
      this.editarHab=true
      this.f.nombre.patchValue(this.habitacion.Codigo)
      this.f.tipo.patchValue(this.habitacion.Tipo)
      this.f.descripcion.patchValue(this.habitacion.Descripcion)
      this.f.adultos.patchValue(this.habitacion.Adultos)
      this.f.ninos.patchValue(this.habitacion.Ninos)
      this.f.vista.patchValue(this.habitacion.Vista)
      this.f.tarifaBase.patchValue(this.habitacion.Tarifa)
      this.f.inventario.patchValue(this.habitacion.Inventario)
      this.f.etiqueta.patchValue(this.habitacion.Numero)

      //this.formGroup.controls["nombreHabs"].patchValue(this.habitacion.Tipos_Camas)
    }
    this.inputs.push(this.inputForm);
  }

  checkEdicion(){
    if (this.editarHab===true){
      this.resultLocation.push(...this.habitacion.Amenidades);
      this.resultLocationCamas.push(...this.habitacion.Tipos_Camas);
    }
  };

  get inputs() {
    return this.formGroup.controls["nombreHabs"] as FormArray;
  }
  get f(){
    return this.formGroup.controls;
  }


  async getCodigos(flag:boolean){

    const roomsCodesIndexDB:Codigos[] = await this._codigosService.readIndexDB("Codes");

    if(roomsCodesIndexDB){
      if(roomsCodesIndexDB.length !== 0){
        this._codigosService.setcurrentCodigosValue = roomsCodesIndexDB
        this.constructCodesArray(roomsCodesIndexDB);

      }else{
        const sb = this._codigosService.getAll()
        .pipe(
          filter(array => array.length > 0),
          map(results => results.filter(r => r.Tipo ==='HAB' || r.Tipo === 'AME' || r.Tipo === 'CAMA')),
          takeUntil(this.ngUnsubscribe))
          .subscribe((val)=>{
            this.constructCodesArray(val);
      })
        this.subscriptions.push(sb)
      }
    }else
    {
      const sb = this._codigosService.getAll()
      .pipe(
        filter(array => array.length > 0),
        map(results => results.filter(r => r.Tipo ==='HAB' || r.Tipo === 'AME' || r.Tipo === 'CAMA')),
        takeUntil(this.ngUnsubscribe))
        .subscribe((val)=>{
          this.constructCodesArray(val)
    })
      this.subscriptions.push(sb)
    }

  }

  constructCodesArray(val:Codigos[]){
    this.tiposArr= val.filter(hab=> hab.Tipo === 'HAB');
            this.amenidadesArr = val.filter(hab=> hab.Tipo === 'AME')
            this.camasArr = val.filter(hab=> hab.Tipo === 'CAMA')
  
            for(let i=0;i<this.amenidadesArr.length;i++){
              this.disponiblesIndexados.push({key:i,value:this.amenidadesArr[i].Descripcion})
            }
            for(let i=0;i<this.camasArr.length;i++){
              this.disponiblesIndexadosCamas.push({key:i,value:this.camasArr[i].Descripcion,cantidad:1})
            }
            this.checkEdicion();
            this._codigosService.setcurrentCodigosValue = val
  }

  camasValue(selected:any){
    this.resultLocationCamas = this.resultLocationCamas.filter((option) => {
      return option !== selected;
    });
  }

  amenidadesValue(selected:string){
    this.resultLocation = this.resultLocation.filter((option) => {
      return option !== selected;
    });
  }

  addInput(){
    this.quantityInv++;
    this.formGroup.controls['inventario'].patchValue(this.quantityInv)

      this.inputForm = this.fb.group({
        nombreHabs: [''],
    });

    this.inputs.push(this.inputForm);
  }

  removeInput(){
    if(this.quantityInv>1)
      {
      this.quantityInv--;
      this.inputs.removeAt(this.quantityInv-1);

      }
      else
      {this.quantityInv}

      this.formGroup.controls['inventario'].patchValue(this.quantityInv)
  }

  resetForm(){

    this.formGroup.controls['descripcion'].patchValue('')
    this.formGroup.controls['tipo'].patchValue('')
    this.formGroup.controls['nombre'].patchValue('')
    this.formGroup.controls['vista'].patchValue('')
    this.formGroup.controls['orden'].patchValue('')

    this.quantity=1
    this.quantityExtra=0
    this.formGroup.controls['adultos'].patchValue(this.quantity)
    this.formGroup.controls['ninos'].patchValue(this.quantity)

    this.amenidadesArr=[]
    this.resultLocation=[]
    this.disponiblesIndexadosCamas=[]
    this.resultLocationCamas=[]

    this.f.tipo.patchValue(0)
    this.camasFC.markAsUntouched();
    this.amenidadesFC.markAsUntouched();

  }

  async onSubmit(){
    let habitacionNueva:Habitacion
    this.inicio=false
    const codigoHab = this.formGroup.value.nombre.replace(' ', '_')

    if(this.formGroup.invalid || this.resultLocation.length === 0 || this.resultLocation.length === 0){
      if(this.resultLocation.length === 0 ){
        this.amenidadesFC.markAsUntouched();
      }
      if(this.resultLocationCamas.length === 0){
        this.camasFC.markAllAsTouched();
      }
      this.findInvalidControls()
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.controls[key].markAsDirty();
      });
      return
    }else {
    this.isLoading=true

    let conteoCamas=0;

    for(let y=0;y<this.camasFC.value.length; y++){
      let numero
      numero=parseInt(this.camasFC.value[y].split(' ')[0])
      conteoCamas=numero+conteoCamas
    }

  let nombreHabs:any[]=[]

  for(let y=0; y<this.formGroup.value.nombreHabs.length;y++){
    if(this.formGroup.value.nombreHabs[y].nombreHabs==''){
      nombreHabs.push({nombreHabs:this.formGroup.value.nombre.toString()+((y+1).toString())})
    }
  }

  if(this.editarHab==true){
    habitacionNueva = {
      _id:'',
      Codigo:codigoHab,
      Numero:this.formGroup.value.etiqueta,
      Descripcion:this.formGroup.value.descripcion,
      Tipo:this.formGroup.value.tipo,
      Adultos:this.formGroup.value.adultos,
      Ninos:this.formGroup.value.ninos,
      Inventario:this.formGroup.value.inventario,
      Vista:this.formGroup.value.vista,
      Camas:conteoCamas,
      Tipos_Camas:this.camasFC.value,
      Amenidades:this.amenidadesFC.value,
      Orden:this.formGroup.value.orden,
      Tarifa:this.formGroup.value.tarifaBase
    }
  }else {
    if(nombreHabs.length!=0){
      habitacionNueva = {
        _id:'',
        Codigo:codigoHab,
        Numero:nombreHabs,
        Descripcion:this.formGroup.value.descripcion,
        Tipo:this.formGroup.value.tipo,
        Adultos:this.formGroup.value.adultos,
        Ninos:this.formGroup.value.ninos,
        Inventario:this.formGroup.value.inventario,
        Vista:this.formGroup.value.vista,
        Camas:conteoCamas,
        Tipos_Camas:this.camasFC.value,
        Amenidades:this.amenidadesFC.value,
        Orden:this.formGroup.value.orden,
        Tarifa:this.formGroup.value.tarifaBase
      }
    }else{
      habitacionNueva = {
        _id:'',
        Codigo:codigoHab,
        Numero:this.formGroup.value.nombreHabs,
        Descripcion:this.formGroup.value.descripcion,
        Tipo:this.formGroup.value.tipo,
        Adultos:this.formGroup.value.adultos,
        Ninos:this.formGroup.value.ninos,
        Inventario:this.formGroup.value.inventario,
        Vista:this.formGroup.value.vista,
        Camas:conteoCamas,
        Tipos_Camas:this.camasFC.value,
        Amenidades:this.amenidadesFC.value,
        Orden:this.formGroup.value.orden,
        Tarifa:this.formGroup.value.tarifaBase
      }
    }
  }

  let tarifa : Tarifas= {
    Tarifa:'Tarifa Estandar',
    Habitacion:codigoHab,
    Llegada:new Date(),
    Salida:new Date(new Date().setFullYear(new Date().getFullYear() + 99)),
    Plan:'Ninguno',
    Politicas:'Ninguno',
    Adultos:1,
    Ninos:0,
    EstanciaMinima:1,
    EstanciaMaxima:0,
    Estado:true,
    TarifaRack:this.formGroup.value.tarifaBase,
    TarifaXAdulto:[this.formGroup.value.tarifaBase],
    TarifaXNino:[this.formGroup.value.tarifaBase],

    Dias:[
      {name:'Lun', value:0, checked:true},
      {name:'Mar', value:1, checked:true},
      {name:'Mie', value:2, checked:true},
      {name:'Jue', value:3, checked:true},
      {name:'Vie', value:4, checked:true},
      {name:'Sab', value:5, checked:true},
      {name:'Dom', value:6, checked:true}
    ]
  }
    let promptFLag=false;
    const request1 = this.habitacionService.postHabitacion(habitacionNueva,this.editarHab,this.formGroup.value.image); 
    const request3 = this._tarifasService.postTarifa(tarifa)
    //concat(request1,request2,request3).pipe(
    concat(request1, request3).pipe(
      takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (val)=>{
          if(!promptFLag){
            this.promptMessage('Exito','Habitación(es) Generadas con éxito')
            promptFLag=true;
          }
            this.habitacionGenerada = true
                this.modal.close()
                this.habitacionService.sendCustomFormNotification(true)
                this.sendUpload=true
        },
        error: (error) =>{
            this.isLoading=false
            if(!promptFLag){
              this.promptMessage('Error','No se pudo guardar la habitación intente de nuevo mas tarde');
              promptFLag=true;
            }
                      
        }
      })  
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.formGroup.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
}

  // checkbox(value:any){
  //   if(value){
  //     this.checkBox=true
  //   }else {
  //     this.checkBox=false
  //   }
  // }

    // FormHelpers
    isControlValid(controlName: string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }

    isControlInvalid(controlName: string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
    }

    controlHasError(validation:string, controlName:string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.hasError(validation) && (control.dirty || control.touched);
    }

    isControlTouched(controlName:string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.dirty || control.touched;
    }

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
        const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

        return invalidCtrl || invalidParent;
    }

    plus()
    {
        this.quantity++;
        this.formGroup.controls['adultos'].patchValue(this.quantity)
        //this.formGroup.controls['ninos'].updateValueAndValidity();
    }
    minus()
    {
      if(this.quantity>1)
      {
      this.quantity--;
      this.formGroup.controls['adultos'].patchValue(this.quantity)

      }
      else
      this.quantity
      this.formGroup.controls['adultos'].patchValue(this.quantity)

    }

    plusExtra()
    {
        this.quantityExtra++;
        this.formGroup.controls['ninos'].patchValue(this.quantityExtra)

    }
    minusExtra()
    {
      if(this.quantityExtra>0)
      {
      this.quantityExtra--;
      this.formGroup.controls['ninos'].patchValue(this.quantityExtra)

      }
      else
      this.quantityExtra
      this.formGroup.controls['ninos'].patchValue(this.quantityExtra)


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

    promptMessage(header:string,message:string, obj?:any){
      const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertHeader = header
      modalRef.componentInstance.mensaje= message    
      modalRef.result.then((result) => {
        if(result=='Aceptar')        
        {
          // this.deleteTarifaRackEspecial(element)
          // this.tarifaEspecialArray=[]
        } 
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        setTimeout(() => {
          modalRef.close('Close click');
        },4000)
        return
    }

    imageSelectedFunc(){
      this.imageSelected=true;
    }


    closeModal()
    {
      this.modal.close();
    }

    ngOnDestroy(): void {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();    
    }

}
