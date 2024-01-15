import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Divisas } from './_models/divisas';
import { TimeZones } from './_models/timezone';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimezonesService } from './_services/timezones.service';
import { DivisasService } from './_services/divisas.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ParametrosService } from './_services/parametros.service';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Parametros } from './_models/parametros';
const DEFAULT_TIMEZONE = {
  _id:'',
  Codigo:'MX',
  Nombre:'(UTC-05:00) America/Mexico_City',
  UTC:'-6:00'
}
const DEFAULT_DIVISA = {
  _id:'',
  Localidad:'Mexico',
  Nombre:'PESO',
  Simbolo:'$'
}
@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.scss']
})
export class ParametrosComponent implements OnInit, OnDestroy{
/**SIte Helpers */
isLoading:Boolean=false

susbcription:Subscription[]=[]

formGroup : FormGroup
zonaHoraria:TimeZones[]=[]
fechas:Date
timezone : string='America/Mexico_City'
divisas : Divisas[]=[]
checkOutList : string[]=['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00',
'12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30']

constructor(
  public fb : FormBuilder,
  public modal : NgbModal,
  public timezonesService : TimezonesService,
  public divisasService:DivisasService,
  public _parametrosService:ParametrosService,
  public authService : AuthService
) { 
  this.fechas= new Date();
  this._parametrosService.getCurrentParametrosValue
}


ngOnInit(): void {
  this.initForm();

  this.setFormGroup();
  this.getTimeZones();
  this.getDivisas();
}

ngOnDestroy():void
{
  this.susbcription.forEach(sb=>sb.unsubscribe())
}

setFormGroup(){

      this.formGroup.controls['timeZone'].setValue(this._parametrosService.getCurrentParametrosValue.codigoZona);
      this.formGroup.controls['divisa'].setValue(this._parametrosService.getCurrentParametrosValue.divisa);
      this.formGroup.controls['iva'].setValue(this._parametrosService.getCurrentParametrosValue.iva);
      this.formGroup.controls['ish'].setValue(this._parametrosService.getCurrentParametrosValue.ish);
      this.formGroup.controls['checkOut'].setValue(this._parametrosService.getCurrentParametrosValue.checkOut);
      this.formGroup.controls['checkIn'].setValue(this._parametrosService.getCurrentParametrosValue.checkIn);
      this.formGroup.controls['noShow'].setValue(this._parametrosService.getCurrentParametrosValue.noShow);
      this.formGroup.controls['auditoria'].setValue(this._parametrosService.getCurrentParametrosValue.auditoria);
}

getTimeZones()
{
  const sb = this.timezonesService.getTimeZones().subscribe(
    (value:any)=>{
      if(value)
      {this.zonaHoraria=value}
      else 
      {this.zonaHoraria.push(DEFAULT_TIMEZONE)}
    },
    (error)=>{
      const modalRef=this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertsHeader = 'Error'
      modalRef.componentInstance.mensaje='No se pudo cargar la lista de zonas horarias intente actualizando la pagina'
    },
    ()=>{}
    )
    this.susbcription.push(sb)
}

getDivisas(){
  const sb = this.divisasService.getDivisas().subscribe(
    (value:any)=>{
      if(value)
      {this.divisas=value}
      else 
      {this.divisas.push(DEFAULT_DIVISA)}
    },
    (error)=>{
      const modalRef=this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertsHeader = 'Error'
      modalRef.componentInstance.mensaje='No se pudo cargar la lista de zonas horarias intente actualizando la pagina'
    },
    ()=>{}
    )
    this.susbcription.push(sb)
}


get getFormGroupValues() {
  return this.formGroup.controls
}

initForm(){


  this.formGroup = this.fb.group({
    divisa:['',Validators.required],
    timeZone:['',Validators.required],
    iva:['',Validators.required],
    ish:['',Validators.required],
    checkOut:['',Validators.required],
    checkIn:['',Validators.required],
    noShow:['',Validators.required],
    auditoria:['',Validators.required]
  })

}



onSelectTimeZone(zona:string){
  this.timezone=zona
}



submitParametros(){

  // this.isLoading=true

  if(this.formGroup.invalid){
    this.isLoading=false
    return
  }
  

  let codigoZona = this.timezone.split(' ')[0]
  let zona = this.timezone.split(' ')[1]

  let parametros:Parametros = {
    id:this._parametrosService.getCurrentParametrosValue.id,
    divisa:this.getFormGroupValues.divisa.value,
    ish:this.getFormGroupValues.ish.value,
    iva:this.getFormGroupValues.iva.value,
    zona:zona,
    codigoZona:codigoZona,
    noShow:this.getFormGroupValues.noShow.value,
    checkOut:this.getFormGroupValues.checkOut.value,
    checkIn:this.getFormGroupValues.checkIn.value,
    auditoria:this.getFormGroupValues.auditoria.value,
  }

  const sb = this._parametrosService.postParametros(parametros).subscribe(
    (value)=>{
      this.isLoading=false

     const modalRef = this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
     modalRef.componentInstance.alertHeader='Exito'
     modalRef.componentInstance.mensaje='Parametros Actualizados con exito'
      this.setFormGroup()
    },
    (error)=>{
      this.isLoading=false

      const modalRef = this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertHeader='Error'
      modalRef.componentInstance.mensaje='Hubo un error al guardar los parametros intente de nuevo mas tarde'
    },
    )
this.susbcription.push(sb)
}

}

