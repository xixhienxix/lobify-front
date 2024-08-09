/* eslint-disable @angular-eslint/no-output-on-prefix */
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DEFAULT_HUESPED, Huesped } from 'src/app/models/huesped.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HuespedService } from 'src/app/services/huesped.service';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { Adicional } from 'src/app/models/adicional.model';
import { Promesa } from 'src/app/pages/calendar/_models/promesas.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { ConfirmationModalComponent } from 'src/app/_metronic/layout/components/header/reservations/_modals/confirmation-modal.component';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { DateTime } from 'luxon';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { SaldoCuentaComponent } from './components/edoCuenta/components/saldar.cuenta.component';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { EstatusService } from '../../../_services/estatus.service';
import { Codigos } from 'src/app/models/codigos.model';

@Component({
  selector: 'app-edit-reserva',
  templateUrl: './edit-reserva.component.html',
  styleUrls: ['./edit-reserva.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditReservaComponent implements OnInit, OnDestroy{

  formGroup:FormGroup
  isLoading:boolean=false;
  selectedIndex:number
  /**Dates */
  intialDate:Date = new Date();
  todayDate:Date = new Date();

  /**DOM */
  colorAma:string=''
  
  /**Models */
  currentEdoCuenta:edoCuenta[];

  changingPromesasValue: Subject<Promesa[]> = new Subject();
  onSuccessResponse:Subject<boolean> = new Subject();
  adicionalSubject:Subject<Adicional[]> = new Subject();

  //Checkout
  nochesReales:number;
  totalAlojamientoNuevo:number;
  alojamiento_id:string;
  saldoPendiente:number;
  closeResult: string;

  private subscriptions: Subscription[] = [];

  //Model
  currentHuesped:Huesped
  porPagar:number=0;
  pendiente:number=0;
  


  @Input() promesasDisplay:boolean=false;
  @Input() houseKeepingCodes:HouseKeeping[]=[]
  @Input() estatusArray:Estatus[]=[];
  @Input() data:any;
  @Input() llegahoy:boolean=false;
  @Input() currentRoom:Habitacion;
  @Input() codigosCargo:Codigos[]
  @Input() folio:string

  @Output() onAgregarPago: EventEmitter<edoCuenta> = new EventEmitter();
  @Output() onEditRsv: EventEmitter<Huesped[]> = new EventEmitter();
  @Output() onOpenModifica: EventEmitter<Huesped> = new EventEmitter();
  @Output() onOpenEnviarReservacion: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetAdicionales: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetPromesas: EventEmitter<string> = new EventEmitter();
  @Output() onUpdateEstatusHuesped: EventEmitter<Huesped> = new EventEmitter();
  @Output() onAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();
  @Output() onGuardarPromesa: EventEmitter<any> = new EventEmitter();
  @Output() onChangeAmaStatus: EventEmitter<any> = new EventEmitter();
  @Output() onEstatusChange: EventEmitter<any> = new EventEmitter();
  @Output() onEstatusAplicado: EventEmitter<Huesped> = new EventEmitter();
  @Output() onCheckOut: EventEmitter<any> = new EventEmitter();
  @Output() onFetchReservations: EventEmitter<Huesped> = new EventEmitter();
  @Output() onActualizarCuenta: EventEmitter<any> = new EventEmitter();
  constructor(      
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    public fb:FormBuilder,
    private _edoCuentaService: Edo_Cuenta_Service,
    private _huespedService: HuespedService,
    private _estatusService: EstatusService,
    private cdRef: ChangeDetectorRef,
  ){
    this._huespedService.currentHuesped$.subscribe({
      next:(reserva:Huesped)=>{
        this.currentHuesped = reserva
        this.porPagar = reserva.porPagar!
        this.pendiente = reserva.pendiente!
        this.cdRef.detectChanges(); // Manually trigger change detection
      }
    })
  }
  async ngOnInit(){

  
    this.formGroup = this.fb.group({
      estatus : [this.currentHuesped.estatus],
      ama:[this.currentRoom.Estatus]
    });

    // this.changingPromesasValue.subscribe({
    //   next:(value)=>{
    //     this.changingPromesasValue.next(value);
    //   }
    // })

    // this.onSuccessResponse.subscribe({
    //   next:(val)=>{
    //     if(val){
    //       this.onSuccessResponse.next(val)
    //     }
    //   }
    // })

    this.adicionalSubject.subscribe({
      next:(value:Adicional[])=>{
        this.adicionalSubject.next(value);
      }
    });

    this._edoCuentaService.subject.subscribe({
      next:(val)=>{
        console.log("val");
        this.getCuentas();
      }
    })

    const ccounting_Response = await this.getCuentas();

    let fechaDeLlegada = new Date(parseInt(this.currentHuesped.llegada.split('/')[2]),parseInt(this.currentHuesped.llegada.split('/')[1])-1,parseInt(this.currentHuesped.llegada.split('/')[0])) 
    this.intialDate = fechaDeLlegada
    console.log(this.houseKeepingCodes);
    this.colorAma = this.houseKeepingCodes.find((item)=> item.Descripcion === this.currentRoom.Estatus)!?.Color

    // this.formGroup.controls["ama"].patchValue(this.currentRoom.Estatus);
    this.cdRef.detectChanges();

  }

  async getCuentas(){
      this._edoCuentaService.getCuentas(this.currentHuesped.folio).subscribe({
        next:(value)=>{
          this.currentEdoCuenta = value  
          this.cdRef.detectChanges();  
        },
        error:()=>{

        }
    })
  }

  isCurrentStatus(statuses: string[]): boolean {
    return statuses.includes(this.currentHuesped.estatus);
  }

  filteredEstatusArray(ids: number[]): any[] {
    return this.estatusArray.filter(estatus => ids.includes(estatus.id));
  }

  async onRefreshEdoCuenta(flag:boolean){
    if(flag){
      await this.getCuentas();
    }
  }

  setStep(index:number){
    this.selectedIndex=index;
  }

  backgroundColor(estatus:string){
    let color;

    for (let i=0;i<this.estatusArray.length;i++){
      if(estatus==this.estatusArray[i].estatus){
        color = this.estatusArray[i].color
      }
    }
    return color;
  }

  openDialog(huesped:Huesped,estatus:string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
      });
  
  
    modalRef.componentInstance.huesped = huesped;
    modalRef.componentInstance.estatus = estatus;

    modalRef.result.then((result) => {
      if(result != 'Cancel'){
        this.onEstatusChange.emit({huesped,estatus});
      }
    }, (reason) => {
    });
    }

    todaysDateComparer(){
      //Disable CheckIn if the sTart Day is not today
      if(this.intialDate.setHours(0,0,0,0) == this.todayDate.setHours(0,0,0,0)) {
        return true
      }     
      else{
        return false
      }
  }

    openModifica(){
      this.onOpenModifica.emit(this.currentHuesped);
    }

    onChangeAma(cuarto:string,estatus:string){
      this.colorAma = this.houseKeepingCodes.find((item)=> item.Descripcion === estatus)!?.Color
      const estatusDesc = this.houseKeepingCodes.find((item)=> item.Descripcion === estatus)!?.Descripcion

      this.formGroup.controls["ama"].patchValue(estatusDesc);

      this.onChangeAmaStatus.emit({cuarto,estatus})
    }

    calcSuCuenta(){
      return this.currentHuesped.porPagar!
    }

    openEnviarConfirmacion(){
      this.onOpenEnviarReservacion.emit(true)
    }

    honGetAdicionales(flag:boolean){
      if(flag){
        this.onGetAdicionales.emit(true);
      }
    }

    honGetPromesas(folio:string){
        this.onGetPromesas.emit(folio);
    }
    honEstatusAplicado(huesped:Huesped){
      this.onEstatusAplicado.emit(huesped)
    }

    honUpdateEstatusHuesped(huesped:Huesped){
      this.onUpdateEstatusHuesped.emit(huesped)
    }

    honAlertMessage(message:AlertsMessageInterface){
      this.onAlertMessage.emit(message)
    }

    honGuardarPromesa(promesa:any){
      this.onGuardarPromesa.emit(promesa);
    }

    honAgregarPago(pago:edoCuenta){
      this.onAgregarPago.emit(pago)
    }

    honFetchReservations(huesped:Huesped){
      this.onFetchReservations.emit(huesped);
    }

    honCheckOut(estatus:number, folio:number){  
      const todayDate = new Date();
      let Difference_In_TimeFrom_Today = new Date(todayDate).getTime() - new Date(this.currentHuesped.llegada).getTime()
      let Difference_In_TimeFrom_EndDate = new Date(this.currentHuesped.salida).getTime() - new Date(this.currentHuesped.llegada).getTime()

      const nochesAlojadas = Math.ceil(Difference_In_TimeFrom_Today / (1000 * 3600 * 24));
      const nochesReservadas = Math.ceil(Difference_In_TimeFrom_EndDate / (1000 * 3600 * 24));

            if(nochesAlojadas===0){
              this.nochesReales=1;
            }

            this.totalAlojamientoNuevo = 0//this.huesped.tarifa*this.nochesReales

            const cargosSinAlojamiento:edoCuenta[] = this._edoCuentaService.currentCuentaValue.filter(cargos => cargos.Cargo! > 0 && cargos.Descripcion !='Alojamiento');
            const abonos:edoCuenta[] = this._edoCuentaService.currentCuentaValue.filter(abonos=> abonos.Abono!>0)
            const alojamientoAnterior = this._edoCuentaService.currentCuentaValue.filter(alojamiento => alojamiento.Descripcion =='Alojamiento' );
            this.alojamiento_id = alojamientoAnterior[0]._id!

            const totalAbonos = abonos.reduce((previous,current)=>previous+current.Abono!,0)
            const totalCargosSinAlojamiento = cargosSinAlojamiento.reduce((previous,current)=>previous+current.Cargo!,0)

            this.saldoPendiente = (totalCargosSinAlojamiento+this.totalAlojamientoNuevo)-totalAbonos

            const fechaSalida = DateTime.fromISO(this.currentHuesped.salida.split("T")[0]);
            const fechaLlegada = DateTime.fromISO(this.currentHuesped.llegada.split("T")[0]);
            const luxonTodayDate = DateTime.fromJSDate(todayDate);

            if(fechaSalida.startOf("day") >= luxonTodayDate.startOf("day") ){
              const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
              modalRef.componentInstance.alertHeader='Advertencia'
              modalRef.componentInstance.mensaje = 'La fecha de salida del húesped es posterior al dia de hoy, desea realizar un Check-Out anticipado?'
              modalRef.result.then((result) => {
              if(result=='Aceptar'){
                  if(this.saldoPendiente==0){   
                    this.checkOutfunction()
                  }else{
                    this.isLoading=false
                    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
                    modalRef.componentInstance.alertHeader='Advertencia'
                    modalRef.componentInstance.mensaje = 'Aun queda Saldo pendiente en la cuenta desea liquidar la cuenta?'
                    modalRef.result.then((result) => {
                      if(result=='Aceptar'){
                        this.saldarCuenta();
                      }
                      else{
                        this.closeResult = `Closed with: ${result}`;
                      }
                      }, (reason) => {
                          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                      });
            
                    }
                  }
                  if(result=='Close click')
                  {
                    this.isLoading=false
                  }
                  this.closeResult = `Closed with: ${result}`;
                  }, (reason) => {
                    console.log((reason));
                    this.isLoading=false
                    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                  });
      }else {
          if (this.currentHuesped.pendiente==0){
            this.onEstatusChange.emit({huesped: this.currentHuesped,estatus:estatus, checkout:true});
          }else{
            this.isLoading=false

            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader='Advertencia'
            modalRef.componentInstance.mensaje = 'Aun queda Saldo pendiente en la cuenta desea liquidar la cuenta?'
            
            modalRef.result.then((result) => {
              if(result=='Aceptar'){
                this.saldarCuenta();
                modalRef.close();
              }
              else{
                this.closeResult = `Closed with: ${result}`;
              }
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              });
    
          }
        }
    }

    saldarCuenta(){
    
      const modalRef = this.modalService.open(SaldoCuentaComponent,{size:'sm' , backdrop:'static'})
      modalRef.componentInstance.folio=this.currentHuesped.folio
      modalRef.componentInstance.saldoPendiente=this.saldoPendiente

      const sb = modalRef.componentInstance.passEntry.subscribe(() => {
        //Recibir Data del Modal usando EventEmitter
        this.checkOutfunction();
        modalRef.close();
        })

      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

        this.subscriptions.push(sb)
    }

    checkOutfunction(){

      this.currentHuesped.salida = new Date().toISOString();
      this.currentHuesped.pendiente = 0
      this.currentHuesped.porPagar = 0
      this.currentHuesped.noches = this.nochesReales
      this.currentHuesped.estatus = 'Check-Out';
      
      const sb = this._huespedService.updateEstatusHuesped(this.currentHuesped).subscribe({  
        next:(value)=>{
          this.onFetchReservations.emit();

          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='EXITO'
          modalRef.componentInstance.mensaje = 'Chek-Out Realizado con Exito '
        
          this.onActualizarCuenta.emit({alojamiento_id: this.alojamiento_id, alojamientoNuevo: this.totalAlojamientoNuevo});
        },
        error:(err)=>{
          if(err){
            const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader='ERROR'
            modalRef.componentInstance.mensaje = 'Ocurrio un Error al momento del Check-out intente de nuevo mas tarde'
          
              setTimeout(() => {
                modalRef.close('Close click');
              },4000)
                }
                this.isLoading=false
        },
        complete:()=>{
        }
      });
      this.subscriptions.push(sb)
    }

    confirmaReserva(estatus:number,folio:string){
      this.isLoading=true
      let edoFiltrado : any
      let totalCargos
      let totalAbonos

      if( estatus === 12 || estatus === 11 || estatus ===4 ){
        edoFiltrado = this.currentEdoCuenta.filter((result)=> result.Abono! > 1)
        
        console.log(edoFiltrado) 

        if(edoFiltrado.length<0){ 
          for(let i=0; i<edoFiltrado.length; i++){
            totalCargos = totalCargos + edoFiltrado[i].Cargo
            totalAbonos = totalAbonos + edoFiltrado[i].Abono
          }
          if(totalAbonos<totalCargos){
            this.onAlertMessage.emit({tittle: 'Advertencia', message:'El huesped tiene saldo a Favor, aplique una devolucion antes de darle Check-Out'});
            return
          }
        }
        this.isLoading=false
      }
          const sb = this._estatusService.actualizaEstatus(estatus.toString(),folio,this.currentHuesped)
          .subscribe({
            next:()=>{
              this.isLoading=false
              let mensaje_exito=''
              switch (estatus) {
                case 3:
                  mensaje_exito = "Reservación confirmada";
                  break;
                case 2:
                  mensaje_exito = "Reservación realizada con éxito";
                  break;
                case 1:
                  mensaje_exito = "Check-in realizado con éxito";
                  break;
                case 4:
                  mensaje_exito = "Check-out realizado con éxito";
                  break;
                case 11:
                  mensaje_exito = "No-show, para reactivar la reservación haga clic en el botón en la parte inferior";
                  break;
                case 12:
                  mensaje_exito = "Reservación cancelada con éxito";
                  break;
              }

              this.onAlertMessage.emit({tittle: 'EXITO', message: mensaje_exito});
              this.onFetchReservations.emit();

                this.closeModal()

            },
            error:(err)=>{
              if(err){

                this.isLoading=false

                const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
                modalRef.componentInstance.alertHeader='ERROR'
                modalRef.componentInstance.mensaje='Ocurrio un Error al actualizar el estatus, vuelve a intentarlo'
                modalRef.result.then((result) => {
                  this.closeResult = `Closed with: ${result}`;
                  }, (reason) => {
                      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                  });
                  setTimeout(() => {
                    modalRef.close('Close click');
                  },4000)
                    }
            },
            complete:()=>{
      
            
            }
          })
        this.subscriptions.push(sb)
    }
    
    getDismissReason(reason: any): string {
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}


