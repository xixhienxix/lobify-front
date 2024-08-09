import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DateTime } from "luxon";
import { catchError, of, Subscription, tap } from "rxjs";
import { AlertsComponent } from "src/app/_metronic/shared/alerts/alerts.component";
import { Huesped } from "src/app/models/huesped.model";
import { Huesped_Detail } from "src/app/pages/calendar/_models/huesped-details.model";
import { ParametrosService } from "src/app/pages/parametros/_services/parametros.service";
import { Huesped_Detail_Service } from "src/app/services/huesped.details.service";
import { HuespedService } from "src/app/services/huesped.service";
const EMPTY_DETAILS ={
    ID_Socio:0,
    Nombre:'',
    email:'',
    telefono:'',
    tipoHuesped:'',
    fechaNacimiento:'',
    trabajaEn:'',
    tipoDeID:'',
    numeroDeID:'',
    direccion:'',
    pais:'',
    ciudad:'',
    codigoPostal:'',
    lenguaje:'',
    notas:''
  }
@Component({
    selector: 'app-huesped',
    templateUrl: './huesped.component.html',
    styleUrls: ['./huesped.component.scss'],
    encapsulation: ViewEncapsulation.None,
  })
export class HuespedComponent implements OnInit {

  /*RADIO BUTTONS*/
  checkedVIP:boolean=false;
  checkedRegular:boolean=false;
  checkedListaNegra:boolean=false;

  /**DATES */
  fromDate: DateTime;
  toDate: DateTime | null;
  fechaFinalBloqueo:string
  model: NgbDateStruct;
  today:DateTime;
  todayString:string;
  
  /**Subscriptions */
  subscription:Subscription[]=[]

  formGroup: FormGroup;
  facturacionFormGroup: FormGroup;

  /*Models*/
  huesped:Huesped
  details:Huesped_Detail
  detailsList:Huesped_Detail=EMPTY_DETAILS
  id_Socio:number;
  cfdiList: string[] = ['Adquisición de mercancías', 'Devoluciones, descuentos o bonificaciones', 'Gastos en general', 
  'Construcciones', 'Mobiliario y equipo de oficina por inversiones', 'Equipo de transporte',
'Dados, troqueles, moldes, matrices y herramental','Comunicaciones telefónicas','Comunicaciones satelitales','Otra maquinaria y equipo',
'Honorarios médicos, dentales y gastos hospitalarios.','Gastos médicos por incapacidad o discapacidad','Gastos funerales.','Donativos',
'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).','Aportaciones voluntarias al SAR.','Primas por seguros de gastos médicos.',
'Gastos de transportación escolar obligatoria.','Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.','Pagos por servicios educativos (colegiaturas)','Por definir'];

  /*Diseño Dinamico*/
  isLoading:boolean=false;
  inputDisabled:boolean=false;
  
  @Input() currentHuesped:Huesped;

  constructor(
    public formatter: NgbDateParserFormatter,
    private customerService:HuespedService,
    private calendar : NgbCalendar,
    private i18n:NgbDatepickerI18n,
    public modal: NgbActiveModal,
    public fb : FormBuilder,
    public modalService : NgbModal,
    private detallesService : Huesped_Detail_Service,
    public _parametrosService : ParametrosService
  ) 
  {  
    this.today = DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona)

    this.fromDate = DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona) 
    this.toDate = DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona).plus({ days: 1 }) 

    this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year 
  }

  ngOnInit(): void {

    if(this.currentHuesped.estatus=='Reserva Cancelada'||this.currentHuesped.estatus=='No Show'||this.currentHuesped.estatus=='Check-Out')
    {this.inputDisabled=true}

       const sb =this.detallesService.getDetailsById(this.currentHuesped.ID_Socio!).subscribe(
        (response)=>{
          this.detailsList=response
          if(response){
            this.id_Socio=this.detailsList.ID_Socio

            this.formGroup.controls['trabajaEn'].setValue(this.detailsList.trabajaEn)
            this.formGroup.controls['fechaNacimiento'].setValue(this.detailsList.fechaNacimiento)
            this.formGroup.controls['tipoDeID'].setValue(this.detailsList.tipoDeID)
            this.formGroup.controls['numeroDeID'].setValue(this.detailsList.numeroDeID)
            this.formGroup.controls['direccion'].setValue(this.detailsList.direccion)
            this.formGroup.controls['pais'].setValue(this.detailsList.pais)
            this.formGroup.controls['ciudad'].setValue(this.detailsList.ciudad)
            this.formGroup.controls['codigoPostal'].setValue(this.detailsList.codigoPostal)
            this.formGroup.controls['lenguaje'].setValue(this.detailsList.lenguaje)
            this.formGroup.controls['notas'].setValue(this.detailsList.notas)
          }
          else {
            this.detailsList=EMPTY_DETAILS
            this.id_Socio=this.detailsList.ID_Socio
          }
          

        },
        (error)=>{
          this.detailsList=EMPTY_DETAILS
        }
        )
        this.subscription.push(sb)
    
    this.subscription.push(sb)
    this.loadForm();

  }

  loadForm() {

    if(this.currentHuesped.tipoHuesped=="Regular"){this.checkedRegular=true}
    if(this.currentHuesped.tipoHuesped=="VIP"){this.checkedVIP=true}
    if(this.currentHuesped.tipoHuesped=="Lista Negra"){this.checkedListaNegra=true}


    this.formGroup = this.fb.group({
      nombre: [this.currentHuesped.nombre, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: [this.currentHuesped.email, Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: [this.currentHuesped.telefono, Validators.compose([Validators.nullValidator,Validators.minLength(10),Validators.maxLength(14)])],
      trabajaEn: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      fechaNacimiento: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      tipoDeID: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      numeroDeID: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      direccion: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      pais: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      ciudad: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      codigoPostal: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      lenguaje: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      notas:[''],
    });

    this.facturacionFormGroup= this.fb.group({
      razonsocial : ['',Validators.required],
      rfc:['',Validators.required],
      cfdi:['',Validators.required],
      email:['',Validators.required]
    })
  }

  get f() {
    return this.formGroup.controls
  }

  formatDate(fecha:any){
  this.todayString= fecha.day+" de "+this.i18n.getMonthFullName(fecha.month)+" del "+fecha.year
  }

  save() {
    this.getNumeroSocio();
    this.prepareHuesped();
    // this.create();
  }

  vipChecked(){
    this.checkedListaNegra=false;
    this.checkedRegular=false;
    this.checkedVIP=true
  }
  regularChecked(){
    this.checkedListaNegra=false;
    this.checkedRegular=true;
    this.checkedVIP=false
  }
  listaNegraChecked(){
    this.checkedListaNegra=true;
    this.checkedRegular=false;
    this.checkedVIP=false
  }

  private prepareHuesped() {

    if(this.checkedRegular){this.currentHuesped.tipoHuesped="Regular"}
    if(this.checkedVIP){this.currentHuesped.tipoHuesped="VIP"}
    if(this.checkedListaNegra){this.currentHuesped.tipoHuesped="Lista Negra"}
    const formData = this.formGroup.value;
    this.currentHuesped.nombre = formData.nombre
    this.currentHuesped.email = formData.email
    this.currentHuesped.telefono = formData.telefono
    this.currentHuesped.folio=this.currentHuesped.folio
    this.currentHuesped.notas=formData.notas
    this.currentHuesped.ID_Socio=this.id_Socio

    this.detailsList = {
      ID_Socio:this.id_Socio,
      Nombre:formData.nombre,
      email:formData.email,
      telefono:formData.telefono,
      tipoHuesped:formData.tipoHuesped,
      fechaNacimiento:formData.fechaNacimiento,
      trabajaEn:formData.trabajaEn,
      tipoDeID:formData.tipoDeID,
      numeroDeID:formData.numeroDeID,
      direccion:formData.direccion,
      pais:formData.pais,
      ciudad:formData.ciudad,
      codigoPostal:formData.codigoPostal,
      lenguaje:formData.lenguaje,
      notas:formData.notas,
    }
    this.isLoading=true;
    const sb = this.customerService.updateHuesped(this.currentHuesped).subscribe(
      (value)=>{

        const sb = this.detallesService.updateDetails(this.detailsList).subscribe(
          (response)=>{
            this.isLoading=false
            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef.componentInstance.alertHeader='Exito'
              modalRef.componentInstance.mensaje = 'Datos del Huesped Actualizados con exito'
          },
          (error)=>{
            if(error)
            {
              this.isLoading=false

              const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef.componentInstance.alertHeader='Error'
              modalRef.componentInstance.mensaje = 'No se pudieron actualizar los datos del detalle del huesped'
            }
          })
          this.subscription.push(sb)
      },
      (error)=>{
        if(error)
        {
          this.isLoading=false

          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje = 'No se pudieron actualizar los datos del Huesped'
        }
      }
      );
      this.subscription.push(sb)


  }
  formReset(){
    this.formGroup.reset()
  }
  
  getNumeroSocio(){
   const sb = this.detallesService.getDetails().subscribe(
      (value)=>{
        if(value){
          this.id_Socio = value.ID_Socio + 1
        }else{
          this.id_Socio = 1
        }
        this.details=value

      },
      (err)=>{
        if(err){
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje ='No se pudieron recuperar los datos del numero de Socio'
        }
      })
      this.subscription.push(sb)
  }

  // idSocio(){
  //   if(!this.details){
  //     this.id_Socio = 1
  //   }else {
  //     this.id_Socio = this.details.ID_Socio + 1
  //   }
  // }

//   create() {
//     const sbCreate = this.customerService.addPost(this.currentHuesped).pipe(
//       tap(() => {
//         this.modal.close();
//       }),
//       catchError((errorMessage) => {
//         this.modal.dismiss(errorMessage);
//         return of(this.currentHuesped);
//       }),
//     ).subscribe((res: Huesped) => this.currentHuesped = res);
//     this.subscription.push(sbCreate);
//   }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation:any, controlName:any): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  //FORMFACTURA
  isControlValidFactura(controlName: string): boolean {
    const control = this.facturacionFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalidFactura(controlName: string): boolean {
    const control = this.facturacionFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorFactura(validation:any, controlName:any): boolean {
    const control = this.facturacionFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName:any): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
    //   this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
    //   this.toDate = date;
    } else {
      this.toDate = null;
    //   this.fromDate = date;
    }
  }


  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  ngOnDestroy(): void {
    this.subscription.forEach(sb => sb.unsubscribe());
  }
}