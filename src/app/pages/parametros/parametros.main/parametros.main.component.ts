import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, firstValueFrom, forkJoin, of, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { TimeZones } from '../_models/timezone';
import { TimezonesService } from '../_services/timezones.service';
import { Divisas } from '../_models/divisas';
import { Parametros } from '../_models/parametros';
import { DivisasService } from '../_services/divisas.service';
import { ParametrosService } from '../_services/parametros.service';
import { LogService } from 'src/app/services/activity-logs.service';

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
  selector: 'app-parametros-main',
  templateUrl: './parametros.main.component.html',
  styleUrls: ['./parametros.main.component.scss']
})
export class ParametrosMainComponent implements OnInit, OnDestroy{
/**SIte Helpers */
isLoading:Boolean=false

susbcription:Subscription[]=[]

formGroup : FormGroup
zonaHoraria:TimeZones[]=[]
fechas:Date
timezone : string='America/Mexico_City'
divisas : Divisas[]=[]
inventarioList = [10,20, 30, 40, 50]
personasQtyList = [10,20, 30, 40, 50]
checkOutList : string[]=['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00',
'12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30']
cancelacionList:string[]=['No Reembolsable']
iddleTimerList:number[]=[5,10,15,20,25,30,35,40,45,50,55]
currentUtc:string = ''
parametrosModel:Parametros
currentUser:string='root';
allowedValue:number =10 // only 10 rooms is the max number of rooms allowed
// Your existing properties...
searchQuery: string = '';  // Used to store the search query
filteredZonaHoraria: any[] = [];

constructor(
  public fb : FormBuilder,
  public modal : NgbModal,
  public timezonesService : TimezonesService,
  public divisasService:DivisasService,
  public _parametrosService:ParametrosService,
  public _authService : AuthService,
  private _logsService: LogService
) { 
  this.currentUser = this._authService.getUserInfo().username
  this.fechas= new Date();
  this._parametrosService.getCurrentParametrosValue
}


  async ngOnInit(): Promise<void> {
    this.filteredZonaHoraria = this.zonaHoraria; // Initially show all timezones

    this.initForm();
    await this.checkParametrosIndexDB();  // Fetch parameters first
    this.setFormGroup();  // Then set form values
  this.getTimeZones();
  this.getDivisas();
}

ngOnDestroy():void{
  this.susbcription.forEach(sb=>sb.unsubscribe())
}

getCheckEstatusAutoNoShow() {
  return this.parametrosModel?.noShowAutoUpdated ?? false;
}

getCheckEstatusAutoCheckOut() {
  return this.parametrosModel?.autoCheckOut ?? false;
}

setFormGroup(){
      this.formGroup.controls['timeZone'].setValue(this.parametrosModel.codigoZona);
      this.formGroup.controls['divisa'].setValue(this.parametrosModel.divisa);
      this.formGroup.controls['iva'].setValue(this.parametrosModel.iva);
      this.formGroup.controls['ish'].setValue(this.parametrosModel.ish);
      this.formGroup.controls['checkOut'].setValue(this.parametrosModel.checkOut);
      this.formGroup.controls['checkIn'].setValue(this.parametrosModel.checkIn);
      this.formGroup.controls['noShow'].setValue(this.parametrosModel.noShow);
      this.formGroup.controls['tarifasCancelacion'].setValue(this.parametrosModel.tarifasCancelacion);
      this.formGroup.controls['autoCheckOut'].setValue(this.parametrosModel.autoCheckOut);
      this.formGroup.controls['autoNoShow'].setValue(this.parametrosModel.noShowAutoUpdated);
      this.formGroup.controls['iddleTimer'].setValue(this.parametrosModel.iddleTimer);
      this.formGroup.controls['inventario'].setValue(this.parametrosModel.inventario);
}

getTimeZones(){
  const sb = this.timezonesService.getTimeZones().subscribe({
   next: (value:any)=>{
      if(value){
        const filteredRegions = value.filter((item:any) => item.Nombre.includes('America'));
        const currentUtc = value.find((item:any)=> item.Nombre === this.parametrosModel.codigoZona)
        this.currentUtc = currentUtc.UTC+' '+currentUtc.Nombre
        this.formGroup.controls["timeZone"].patchValue(this.currentUtc);
        this.zonaHoraria=filteredRegions
      }
      else 
      {this.zonaHoraria.push(DEFAULT_TIMEZONE)}
    },
   error: ()=>{
      const modalRef=this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertsHeader = 'Error'
      modalRef.componentInstance.mensaje='No se pudo cargar la lista de zonas horarias intente actualizando la pagina'
    }}
    )
    this.susbcription.push(sb)
}

getDivisas(){
  const sb = this.divisasService.getDivisas().subscribe({
   next: (value:any)=> {
      if(value)
      {this.divisas=value}
      else 
      {this.divisas.push(DEFAULT_DIVISA)}
    },
  error: ()=>{
      const modalRef=this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertsHeader = 'Error'
      modalRef.componentInstance.mensaje='No se pudo cargar la lista de zonas horarias intente actualizando la pagina'
    },
    })
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
    tarifasCancelacion:['',Validators.required],
    autoCheckOut:[''],
    autoNoShow:[''],
    inventario:[''],
    iddleTimer: [null, Validators.required],
    maxPersonas:[10,Validators.required]  
  })

}

async checkParametrosIndexDB(refresh: boolean = false) {
  if (refresh) {
    this.parametrosModel = await firstValueFrom(this._parametrosService.getParametros());
    return;
  }

  const parametrosIndexDB: Parametros | null = await this._parametrosService.readIndexDB("Parametros");

  // Default to an empty object if nothing is found to prevent undefined errors
  this.parametrosModel = parametrosIndexDB || await firstValueFrom(this._parametrosService.getParametros()) || {};
}


onSelectTimeZone(zona:string){
  this.timezone=zona;
}

    //CheckEstatus Controls
   findInvalidControlsRecursive(formToInvestigate:FormGroup):string[] {
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



submitParametros(){

  // this.isLoading=true

  if(this.formGroup.invalid){
    const invalidControls = this.findInvalidControlsRecursive(this.formGroup);
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
    tarifasCancelacion:this.getFormGroupValues.tarifasCancelacion.value,
    autoCheckOut: this.getFormGroupValues.autoCheckOut.value,
    noShowAutoUpdated: this.getFormGroupValues.autoNoShow.value,
    inventario: this.getFormGroupValues.inventario.value,
    iddleTimer: this.getFormGroupValues.iddleTimer.value,
    maxPersonas: this.getFormGroupValues.maxPersonas.value
  }

  const sb = this._parametrosService.postParametros(parametros).subscribe({
    next:async(item)=>{
      
      const changedProperties = this._logsService.getChangedProperties(this.parametrosModel, parametros);
      
        const logRequests = this._logsService.logChangedProperties('Parametros Updated',this.currentUser, changedProperties).pipe(
          catchError(error => {
            // Handle error for individual log request if needed
            console.error(`Failed to log parameters Change`, error);
            return of(null); // Return a null observable to keep forkJoin working
          })
        )

      await firstValueFrom(logRequests); // Using firstValueFrom to handle the observable
      
      this.isLoading=false
      this.checkParametrosIndexDB(true);
     const modalRef = this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
     modalRef.componentInstance.alertHeader='Exito'
     modalRef.componentInstance.mensaje='Parametros Actualizados con exito'
      this.setFormGroup()
    },
    error:()=>{
      this.isLoading=false

      const modalRef = this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertHeader='Error'
      modalRef.componentInstance.mensaje='Hubo un error al guardar los parametros intente de nuevo mas tarde'
    },
  });
this.susbcription.push(sb)
}

}

