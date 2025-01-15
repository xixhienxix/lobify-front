import {  AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, signal } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray} from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, concat, filter, map, takeUntil } from 'rxjs';
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
import { VisibilityRates } from 'src/app/models/visibility.model';
import { Politicas } from 'src/app/models/politicas.model';
import { Dias } from 'src/app/models/days.model';
import { duplicateValuesValidator } from '../../_helpers/duplicateValuesValidator';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';

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
export class NewRoomComponent implements OnInit, OnDestroy, AfterViewChecked{

  @ViewChild('itemSelect') public itemSelect: MatSelect;
  @ViewChild('matOption') public matOption: MatOption;
  /**Modal */
  closeResult:string
  @Input() habitacion:Habitacion;

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
  adultos:number=0;
  ninos:number=0;
  quantityInv:number=1;
  personas:number=1;

  //File Upload
  sendUpload: boolean;
  imagen:any;
  imageSelected:boolean=false

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

  readonly options =signal<Dias[]> ([
    {rateIndex:0, name:'Lun', value:0, checked:false},
    {rateIndex:0, name:'Mar', value:1, checked:false},
    {rateIndex:0, name:'Mie', value:2, checked:false},
    {rateIndex:0, name:'Jue', value:3, checked:false},
    {rateIndex:0, name:'Vie', value:4, checked:false},
    {rateIndex:0, name:'Sab', value:5, checked:false},
    {rateIndex:0, name:'Dom', value:6, checked:false}
  ]);

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
    private changeDetector: ChangeDetectorRef, // Fixes Exeption of Expression already Changed,
    private _checkIndexDbService: IndexDBCheckingService,
    private _parametrosService: ParametrosService
  ) {
    console.log('maxInv', this._parametrosService.getCurrentParametrosValue.maxPersonas);
    this.formGroup = this.fb.group({
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      tipo: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      descripcion: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(1000)])],
      personas: [1, [Validators.required, Validators.min(1)]],
      adultos: [1, [Validators.required, Validators.min(1), Validators.max(this._parametrosService.getCurrentParametrosValue.maxPersonas)]],
      ninos: [0, [Validators.required, Validators.min(0), Validators.max(this._parametrosService.getCurrentParametrosValue.maxPersonas - 1)]],
      vista: [''],
      inventario: [1, Validators.required],
      orden:[1,Validators.required],
      habs: this.fb.array([], duplicateValuesValidator()),
      tarifaBase:[0,Validators.required],
      etiqueta:[{value: 0, disabled: true },Validators.required],
    });

    // this.inputForm = this.fb.group({
    //   nombreHabs: ['',],
    // });
  }

  ngOnInit(): void {
  this.getCodigos();
  const name = new FormControl('', Validators.required);
  this.numeroHabs.push(name); // Add a new input

  // this.checkEdicion();

    if(this.habitacion!=undefined){
      this.editarHab=true
      this.f.nombre.patchValue(this.habitacion.Codigo)
      this.f.tipo.patchValue(this.habitacion.Tipo)
      this.f.descripcion.patchValue(this.habitacion.Descripcion)
      this.f.adultos.patchValue(this.habitacion.Adultos)
      this.f.personas.patchValue(this.habitacion.Adultos+ this.habitacion.Ninos)
      this.f.ninos.patchValue(this.habitacion.Ninos)
      this.f.vista.patchValue(this.habitacion.Vista)
      this.f.tarifaBase.patchValue(this.habitacion.Tarifa)
      this.f.inventario.patchValue(this.habitacion.Inventario)
      this.f.etiqueta.patchValue(this.habitacion.Numero)

      //disable Inputs
      this.f.nombre.disable();

      this.adultos = this.habitacion.Adultos;
      this.ninos = this.habitacion.Ninos;
      this.personas = this.habitacion.Adultos + this.habitacion.Ninos

      //this.formGroup.controls["nombreHabs"].patchValue(this.habitacion.Tipos_Camas)
    }
    //this.inputs.push(this.inputForm);
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  checkEdicion(){
    if (this.editarHab === true){
      this.resultLocation.push(...this.habitacion.Amenidades);
      this.resultLocationCamas.push(...this.habitacion.Tipos_Camas);
    }
  };

//   get inputs(): FormArray {
//     return this.formGroup.get('nombreHabs') as FormArray;
// }
  get numeroHabs(): FormArray {
    return this.formGroup.get('habs') as FormArray; // Cast to FormArray
  }

  get f(){
    return this.formGroup.controls;
  }

  // Method to increase  and update inputs
  addInput() {
      const name = new FormControl('', Validators.required);

      this.quantityInv++; // Increase the 
      this.numeroHabs.push(name); // Add a new input
  }

  // Method to decrease  and update inputs
  removeInput() {
      if (this.quantityInv > 1) {
          this.quantityInv--; // Decrease the 
          this.numeroHabs.removeAt(this.numeroHabs.length - 1); // Remove the last input
      }
  }


  async getCodigos(){

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

  resetForm(){

    this.formGroup.controls['descripcion'].patchValue('')
    this.formGroup.controls['tipo'].patchValue('')
    this.formGroup.controls['nombre'].patchValue('')
    this.formGroup.controls['vista'].patchValue('')
    this.formGroup.controls['orden'].patchValue('')

    this.formGroup.controls['adultos'].patchValue(this.adultos)
    this.formGroup.controls['ninos'].patchValue(this.ninos)

    this.amenidadesArr=[]
    this.resultLocation=[]
    this.disponiblesIndexadosCamas=[]
    this.resultLocationCamas=[]

    this.f.tipo.patchValue(0)
    this.camasFC.markAsUntouched();
    this.amenidadesFC.markAsUntouched();

  }

  clearHabsNumber(checked:boolean){
    if(!checked){
      this.numeroHabs.patchValue(this.numeroHabs.controls.map(() => ''));
    }else{
      this.nombreHabs = []
      return
    }
  }

  async onSubmit(){
    let habitacionNueva:Habitacion
    this.inicio=false

    const codigoHab = this.formGroup.controls["nombre"].value.replace(' ', '_')

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
    //this.isLoading=true

    let conteoCamas=0;

    for(let y=0;y<this.camasFC.value.length; y++){
      let numero
      numero=parseInt(this.camasFC.value[y].split(' ')[0])
      conteoCamas=numero+conteoCamas
    }

    if(!this.editarHab){
      for(let y=0; y<this.numeroHabs.value.length;y++){
        if(this.numeroHabs.value[y] === ''){
          this.nombreHabs.push(this.formGroup.value.nombre.toString()+((y+1).toString()))
        }
      }
    }

  

  if(this.editarHab===true){

    habitacionNueva = {
      _id:'',
      Codigo:codigoHab,
      Numero:this.formGroup.value.etiqueta,
      Descripcion:this.formGroup.value.descripcion,
      Tipo:this.formGroup.value.tipo,
      Personas:this.formGroup.value.personas,
      Adultos:this.formGroup.value.adultos,
      Ninos:this.formGroup.value.ninos,
      Inventario:this.quantityInv,
      Vista:this.formGroup.value.vista,
      Camas:conteoCamas,
      Tipos_Camas:this.camasFC.value,
      Amenidades:this.amenidadesFC.value,
      Orden:this.formGroup.value.orden,
      Tarifa:this.formGroup.value.tarifaBase,
      Estatus:'LIMPIA'
    }
  }else {
    if(this.nombreHabs.length === 0){
      habitacionNueva = {
        _id:'',
        Codigo:codigoHab,
        Numero:this.numeroHabs.value,//nombreHabs
        Descripcion:this.formGroup.value.descripcion,
        Tipo:this.formGroup.value.tipo,
        Personas:this.formGroup.value.personas,
        Adultos:this.formGroup.value.adultos,
        Ninos:this.formGroup.value.ninos,
        Inventario:this.quantityInv,
        Vista:this.formGroup.value.vista,
        Camas:conteoCamas,
        Tipos_Camas:this.camasFC.value,
        Amenidades:this.amenidadesFC.value,
        Orden:this.formGroup.value.orden,
        Tarifa:this.formGroup.value.tarifaBase,
        Estatus:'LIMPIA'
      }
    } else{
      habitacionNueva = {
        _id:'',
        Codigo:codigoHab,
        Numero:this.nombreHabs,
        Descripcion:this.formGroup.value.descripcion,
        Tipo:this.formGroup.value.tipo,
        Personas:this.formGroup.value.personas,
        Adultos:this.formGroup.value.adultos,
        Ninos:this.formGroup.value.ninos,
        Inventario:this.quantityInv,
        Vista:this.formGroup.value.vista,
        Camas:conteoCamas,
        Tipos_Camas:this.camasFC.value,
        Amenidades:this.amenidadesFC.value,
        Orden:this.formGroup.value.orden,
        Tarifa:this.formGroup.value.tarifaBase,
        Estatus:'LIMPIA'
      }
    }
  }

  let tarifa : Tarifas= {
    Tarifa:'Tarifa Base',
    Habitacion:codigoHab,
    Llegada:new Date(),
    Salida:new Date(new Date().setFullYear(new Date().getFullYear() + 99)),
    Plan:'Ninguno',
    Adultos:1,
    Politicas:this.politicas(),
    Ninos:0,
    EstanciaMinima:1,
    EstanciaMaxima:0,
    Estado:true,
    TarifaRack:this.formGroup.value.tarifaBase,
    TarifasActivas:[],
    Visibilidad:this.visibility(),
    Cancelacion:this.politicas(),

    Dias:this.options()
  }
    let promptFLag=false;
    const request1 = this.habitacionService.postHabitacion(habitacionNueva, this.editarHab);
    let requests = [request1];
    
    // Conditionally include request3 if editarHab is false
    if (!this.editarHab) {
      const request3 = this._tarifasService.postTarifa(tarifa).pipe(map(() => ({}))); // Cast to an object
      requests.push(request3);
    }
    if(this.editarHab && this.formGroup.value.tarifaBase !== this.habitacion.Tarifa){
      const request3 = this._tarifasService.updateTarifaBase(tarifa).pipe(map(() => ({}))); // Cast to an object
      requests.push(request3);
    }
    
    concat(...requests).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: () => {
        if (!promptFLag) {
          if(requests.length === 1){
            this.promptMessage('Éxito', 'Habitación Actualizada con éxito');
          }else {
            this.promptMessage('Éxito', 'Habitación(es) Generadas con éxito');
          }
          promptFLag = true;
        }
        this.habitacionGenerada = true;
        this.modal.close();
        this.habitacionService.sendCustomFormNotification(true);
        this.sendUpload = true;
        // Run checkIndexedDB with a 1 second delay
        setTimeout(() => {
          this._checkIndexDbService.checkIndexedDB(['habitaciones'], true);
          this._checkIndexDbService.checkIndexedDB(['tarifas'], true);
        }, 1000); // 1000 milliseconds = 1 second
      },
      error: () => {
        this.isLoading = false;
        if (!promptFLag) {
          this.promptMessage('Error', 'No se pudo guardar la habitación, intente de nuevo más tarde');
          promptFLag = true;
        }
      }
    });
    
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
    console.log('Invalid Controls', invalid);
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

    isErrorState(control: FormControl | null): boolean {
        const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
        const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

        return invalidCtrl || invalidParent;
    }

    plus(field: 'personas' | 'adultos' | 'ninos'): void {
      if (field === 'personas') {
        this.personas++;
        this.adultos++;
      } else if (field === 'adultos') {
        if ((this.adultos + this.ninos) < this.personas ) {
          this.adultos++;
        } else if (this.adultos < this.personas){
          this.adultos++;
          this.ninos--;
        }
      } else if (field === 'ninos') {
        if ((this.adultos + this.ninos) < this.personas) {
          this.ninos++;
        } else if( this.ninos < this.personas && this.adultos > 1 ){
          this.ninos++;
          this.adultos--;
        }
      }
      this.updateControls();
    }
  
    minus(field: 'personas' | 'adultos' | 'ninos'): void {
      if (field === 'personas') {
        if (this.personas > 1) {
          this.personas--;
          if(this.adultos === 1 && this.ninos > 0 ){
            this.ninos--;
          }
          if(this.adultos > 1){
            this.adultos--;
          } 
        }
      } else if (field === 'adultos') {
        if (this.adultos > 1) {
          this.adultos--;
        } if(this.adultos < this.personas && (this.ninos + this.adultos) < this.personas){
          this.ninos++
        }
      } else if (field === 'ninos') {
        if (this.ninos > 0) {
          this.ninos--;
          this.adultos++
        }
      }
      this.updateControls();
    }
    
    updateControls():void {
      const currentAdultosValue = this.formGroup.get('adultos')?.value || 0; // Get the current value
      this.formGroup.get('adultos')?.setValue(this.adultos);      // Update the value

      const currentPersonasValue = this.formGroup.get('personas')?.value || 0; // Get the current value
      this.formGroup.get('personas')?.setValue(this.personas);      // Update the value

      const currentNinosValue = this.formGroup.get('ninos')?.value || 0; // Get the current value
      this.formGroup.get('ninos')?.setValue(this.ninos);      // Update the value
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

    promptMessage(header:string,message:string){
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
