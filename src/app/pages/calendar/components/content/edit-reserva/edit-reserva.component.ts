/* eslint-disable @angular-eslint/no-output-on-prefix */
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Huesped } from 'src/app/models/huesped.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HuespedService, overlayResponse } from 'src/app/services/huesped.service';
import { Subject, Subscription, catchError, finalize, firstValueFrom, forkJoin, of, switchMap } from 'rxjs';
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
import { ModificaReservaComponent } from './components/modifica/modifica.reserva.component';
import { Tarifas } from 'src/app/models/tarifas';
import { LogService } from 'src/app/services/activity-logs.service';
import { CommunicationService } from 'src/app/pages/reports/_services/event.services';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';

@Component({
  selector: 'app-edit-reserva',
  templateUrl: './edit-reserva.component.html',
  styleUrls: ['./edit-reserva.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditReservaComponent implements OnInit, OnDestroy, OnChanges{

  /**LOADING SUBJECT */
  loadingSubject: Subject<boolean> = new Subject<boolean>();


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
  standardRatesArray:Tarifas[]=[]
  tempRatesArray:Tarifas[]=[]
  //Checkout
  nochesReales:number;
  totalAlojamientoNuevo:number;
  alojamiento_id:string;
  saldoPendiente:number;
  closeResult: string;
  @Input() isReservaCancelada:boolean=false;

  private subscriptions: Subscription[] = [];

  //Model
  porPagar:number=0;
  pendiente:number=0;

  updatedDesglose : { fecha: string; tarifaTotal: number }[] = [];

  private _currentHuesped!: Huesped;
  private _currentRoom!: Habitacion;

  // @Input()
  // set currentHuesped(value: Huesped) {
  //   this._currentHuesped = value;
  //   if (this.formGroup) {
  //     this.formGroup.patchValue({
  //       estatus: this._currentHuesped.estatus || '',
  //     });
  //     this.cdr.detectChanges();  // Manually trigger change detection after patching the value
  //   }
  // }
  
  // @Input()
  // set currentRoom(value: Habitacion) {
  //   this._currentRoom = value;
  //   if (this.formGroup) {
  //     this.formGroup.patchValue({
  //       ama: this._currentRoom.Estatus || '',
  //     });
  //     this.cdr.detectChanges();  // Manually trigger change detection after patching the value
  //   }
  // }

  // get currentHuesped(): Huesped {
  //   return this._currentHuesped;
  // }

  // get currentRoom(): Habitacion {
  //   return this._currentRoom;
  // }

  @Input() currentRoom: Habitacion;
  @Input() currentHuesped: Huesped;
  @Input() promesasDisplay:boolean=false;
  @Input() houseKeepingCodes:HouseKeeping[]=[]
  @Input() estatusArray:Estatus[]=[];
  @Input() data:any;
  @Input() llegahoy:boolean=false;
  @Input() codigosCargo:Codigos[]
  @Input() folio:string
  @Input() ratesArrayComplete:Tarifas[]=[]
  @Input() roomCodesComplete:Habitacion[]=[]  
  @Input() currentUser:string='';
  @Input() checkOut:string
  @Input() checkIn:string
  @Input() zona:string
  @Input() estadoDeCuenta:edoCuenta[]
  @Input() parametros:Parametros
  

  @Output() onAgregarPago: EventEmitter<edoCuenta> = new EventEmitter();
  @Output() onEditRsv: EventEmitter<Huesped[]> = new EventEmitter();
  @Output() onOpenEnviarReservacion: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetAdicionales: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetPromesas: EventEmitter<string> = new EventEmitter();
  @Output() onUpdateEstatusHuesped: EventEmitter<Huesped> = new EventEmitter();
  @Output() onAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();
  @Output() onGuardarPromesa: EventEmitter<any> = new EventEmitter();
  @Output() onChangeAmaStatus: EventEmitter<any> = new EventEmitter();
  @Output() onEstatusChange: EventEmitter<any> = new EventEmitter();
  @Output() onEstatusAplicado: EventEmitter<Huesped> = new EventEmitter();
  // @Output() onCheckOut: EventEmitter<any> = new EventEmitter();
  @Output() onFetchReservations: EventEmitter<Huesped> = new EventEmitter();
  @Output() onActualizarCuenta: EventEmitter<any> = new EventEmitter();
  @Output() honUpdateHuesped: EventEmitter<any> = new EventEmitter();
  @Output() honRefershDashboard: EventEmitter<boolean> = new EventEmitter();
  @Output() onCloseMainModal: EventEmitter<boolean> = new EventEmitter();
  
  constructor(      
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    public fb:FormBuilder,
    private _edoCuentaService: Edo_Cuenta_Service,
    private _huespedService: HuespedService,
    private _estatusService: EstatusService,
    private cdRef: ChangeDetectorRef,
    private _logService: LogService,
    private _communicationService: CommunicationService,
    private _parametrosService: ParametrosService
  ){
    this._huespedService.currentHuesped$.subscribe({
      next: (reserva: Huesped) => {
        this.currentHuesped = reserva;
        this.porPagar = reserva.porPagar!;
        this.pendiente = reserva.pendiente!;
        this.initializeForm(); // Reinitialize the form when currentHuesped changes
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ratesArrayComplete'] && Array.isArray(changes['ratesArrayComplete'].currentValue)) {
      this.standardRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa Base');
      this.tempRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa De Temporada');
    }
  }

  async ngOnInit() {

    await firstValueFrom(this._edoCuentaService.actualizaTotales(this.currentHuesped.folio));

    this._estatusService.updatedStatus$.subscribe({
      next:(item)=>{
        if(item){
          this.formGroup.patchValue({
            estatus: item
          });        
        }
      }
    })

    // Initialize the form with empty strings or default values
    this.initializeForm();

    this.adicionalSubject.subscribe({
      next:(value:Adicional[])=>{
        this.adicionalSubject.next(value);
      }
    });

    this._edoCuentaService.subject.subscribe({
      next:(val)=>{
        this.getCuentas();
      }
    })

    const ccounting_Response = await this.getCuentas();

    let fechaDeLlegada = new Date(parseInt(this.currentHuesped.llegada.split('/')[2]),parseInt(this.currentHuesped.llegada.split('/')[1])-1,parseInt(this.currentHuesped.llegada.split('/')[0])) 
    this.intialDate = fechaDeLlegada
    this.colorAma = this.houseKeepingCodes.find((item)=> item.Descripcion === this.currentRoom.Estatus)!?.Color

    // this.formGroup.controls["ama"].patchValue(this.currentRoom.Estatus);
    this.cdRef.detectChanges();

    if(this.ratesArrayComplete && this.ratesArrayComplete.length > 0){
      this.standardRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa Base');
      this.tempRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa De Temporada');
    }

  }

  initializeForm(): void {
    if(this.currentRoom && this.currentHuesped){
      this.formGroup = this.fb.group({
        estatus: [this.currentHuesped.estatus], // Default empty value
        ama: [this.currentRoom.Estatus],     // Default empty value
      }); 
    }else{
      this.formGroup = this.fb.group({
        estatus: [''], // Default empty value
        ama: [''],     // Default empty value
      });
    }
  }

  //OPTIMIZED FUNCTIONS
  onCheckOut(data:any){  
    const estatus = data.status
    const folio = data.folio
    const todayDate = DateTime.now();
    const { llegada, salida, pendiente } = this.currentHuesped;

    // Calculate nochesAlojadas and nochesReservadas using Luxon
    const fechaLlegada = DateTime.fromISO(llegada.split("T")[0]);
    const fechaSalida = DateTime.fromISO(salida.split("T")[0]);

    const nochesAlojadas = Math.floor(todayDate.diff(fechaLlegada, 'days').days);
    const nochesReservadas = Math.floor(fechaSalida.diff(fechaLlegada, 'days').days);

    this.nochesReales = nochesAlojadas === 0 ? 1 : nochesAlojadas;
    this.totalAlojamientoNuevo = 0; // this.huesped.tarifa * this.nochesReales

    const cuentaValue = this._edoCuentaService.currentCuentaValue;
    const cargosSinAlojamiento = cuentaValue.filter(({ Cargo, Descripcion }) => Cargo! > 0 && Descripcion !== 'Alojamiento');
    const abonos = cuentaValue.filter(({ Abono }) => Abono! > 0);
    const alojamientoAnterior = cuentaValue.find(({ Descripcion }) => Descripcion === 'Alojamiento');

    if (alojamientoAnterior) {
      this.alojamiento_id = alojamientoAnterior._id!;
    }

    const totalAbonos = abonos.reduce((total, { Abono }) => total + Abono!, 0);
    const totalCargosSinAlojamiento = cargosSinAlojamiento.reduce((total, { Cargo }) => total + Cargo!, 0);

    this.saldoPendiente = totalCargosSinAlojamiento + this.totalAlojamientoNuevo - totalAbonos;

    // Determine if checkout process is needed
    if (fechaSalida.startOf('day') > todayDate.startOf('day')) {
      const modalRef = this.modalService.open(AlertsComponent, { size: 'sm' });
      modalRef.componentInstance.alertHeader = 'Advertencia';
      modalRef.componentInstance.mensaje = 'La fecha de salida del huésped es posterior al día de hoy, ¿desea realizar un Check-Out anticipado?';

      modalRef.result.then((result) => {
        if (result === 'Aceptar') {
          if (this.saldoPendiente === 0) {
            this.checkOutfunction();
          } else {
            this.promptToLiquidateAccount();
          }
        }
        this.isLoading = false;
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.isLoading = false;
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });

    } else {
      if (pendiente === 0) {
        this.onEstatusChange.emit({ huesped: this.currentHuesped, estatus, checkout: true });
      } else {
        this.promptToLiquidateAccount();
      }
    }

  }

  handleLoading(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }

  promptToLiquidateAccount() {
    const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
    modalRef.componentInstance.alertHeader = 'Advertencia';
    modalRef.componentInstance.mensaje = 'Aun queda Saldo pendiente en la cuenta, ¿desea liquidar la cuenta?';
    
    modalRef.result.then((result) => {
      if (result === 'Aceptar') {
        this.saldarCuenta();
      }
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  
  reactivaReserva(){
    this._communicationService.reactivaSubject.next(this.currentHuesped);
  }

  async onEstatusUpdate(estatus: number): Promise<void> {
    const oldStatus = this.currentHuesped.estatus;
    this.isLoading = true;
    let overlap : overlayResponse
    let overlapResponse, validResponse : boolean = false;

    if(estatus === 1){

      const valid = this.validateCheckIn(this.currentHuesped.llegada);
      overlap = await this._huespedService.verifyOverlap(this.currentHuesped);

      if(!valid) {
        validResponse = await this.promptMessage('Error', 'No se puede realizar un Check-In para reservaciones futuras', true);
        this.isLoading=false;
        return
      }
      if(overlap.exist){
        overlapResponse = await this.promptMessage(
          'Conflicto de Reserva Detectado',
          `Esta habitación ya está asignada para hoy${
            overlap.depositoPrevio ? ' a una reserva confirmada con pago anticipado.' : ''
          }${
            this.currentHuesped.estatus === 'Reserva Temporal'
              ? ' La reserva actual es temporal y no tiene garantía de disponibilidad.'
              : ''
          }`,
          true
        );
        this.isLoading = false;

        return; 
      }
    }
  
    this._estatusService.actualizaEstatus(estatus.toString(), this.folio, this.currentHuesped).pipe(
      switchMap(() => {
  
        if (estatus === 1) {
          return this._logService.logChangeStatus(this.currentHuesped.numeroCuarto, 'Check-In', oldStatus, this.currentUser).pipe(
            catchError(error => {
              console.error(`Failed to log reservation for folio: ${this.currentHuesped.folio}`, error);
              return of(null); // Return a null observable to keep the chain working
            })
          );
        }
        
        return of(null); // Return an observable if no logging is needed
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        const statusMessages: { [key: number]: string } = {
          3: "Reservación confirmada",
          2: "Reservación realizada con éxito",
          1: "Check-in realizado con éxito",
          4: "Check-out realizado con éxito",
          11: "No-show, para reactivar la reservación haga clic en el botón en la parte inferior",
          12: "Reservación cancelada con éxito"
        };
  
        this.onAlertMessage.emit({ tittle: 'ÉXITO', message: statusMessages[estatus] || '' });
        this.onFetchReservations.emit();
        this.closeModal();
      },
      error: (err) => {
        this.isLoading = false;
  
        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
        modalRef.componentInstance.alertHeader = 'ERROR';
        modalRef.componentInstance.mensaje = 'Ocurrió un error al actualizar el estatus, vuelve a intentarlo';
        modalRef.result.then(
          result => {
            this.closeResult = `Closed with: ${result}`;
          },
          reason => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
  
        setTimeout(() => {
          modalRef.close('Close click');
        }, 4000);
      }
    });
  }

  setStep(index:number){
    this.selectedIndex=index;
  }

  openModifica(){
    const standardRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa Base');
    const tempRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa De Temporada');
    const roomCodes = Object.values(
      this.roomCodesComplete.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
    ); 

    const modalRef = this.modalService.open(ModificaReservaComponent,{ size: 'lg', backdrop:'static' })  
    modalRef.componentInstance.currentHuesped = this.currentHuesped;
    modalRef.componentInstance.parametros = this._parametrosService.getCurrentParametrosValue
    modalRef.componentInstance.estatusArray = this.estatusArray
    modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
    modalRef.componentInstance.roomCodes=roomCodes
    modalRef.componentInstance.ratesArrayComplete = this.ratesArrayComplete
    modalRef.componentInstance.standardRatesArray = standardRatesArray
    modalRef.componentInstance.tempRatesArray = tempRatesArray
    modalRef.componentInstance.editHuesped = true;
    modalRef.componentInstance.checkIn = this.checkIn
    modalRef.componentInstance.checkOut=this.checkOut
    modalRef.componentInstance.zona=this._parametrosService.getCurrentParametrosValue.codigoZona



    modalRef.componentInstance.honUpdateHuesped.subscribe({
      next:async (huespedArray:any)=>{
        
          const pago = {
            Folio:huespedArray.huesped.folio,
            Forma_de_Pago:'',
            Fecha:new Date(),
                  Descripcion:'HOSPEDAJE',
                  Cantidad:1,
                  Cargo:huespedArray.huesped.pendiente,
                  Abono:0,
                  Total:huespedArray.huesped.pendiente,
                  Estatus:'Activo',
          }
        this.honUpdateHuesped.emit({updatedHuesped:huespedArray.huesped,pago, oldProperties:huespedArray.beforeChanges})
        modalRef.close();
      }
    })
    
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  
      return
  }

  ///// NOT OPTIMIZED 

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

  calculatePendiente(): number {
    if (!this.currentEdoCuenta) {
      return 0; // Return 0 if the data is undefined
    }
  
    return this.currentEdoCuenta.reduce((acc, item) => {
      if (item?.Estatus === 'Cancelado') {
        return acc; // Skip this item
      }
      const cargo = item?.Cargo ?? 0; // Default to 0 if Cargo is undefined
      const abono = item?.Abono ?? 0; // Default to 0 if Abono is undefined
      return acc + cargo - abono; // Accumulate the result
    }, 0); // Initial value is 0
  }
  
  calculateBalance(): number {
    if (!this.currentEdoCuenta) {
      return 0; // Return 0 if the data is undefined
    }
  
    return this.currentEdoCuenta.reduce((acc, item) => {
      if (item?.Estatus === 'Cancelado') {
        return acc; // Skip this item
      }
      const cargo = item?.Cargo ?? 0; // Default to 0 if Cargo is undefined
      return acc + cargo; // Accumulate the cargos
    }, 0); // Initial value is 0
  }
  
  calculaPagosYPendientes(): number {
    if (!this.currentEdoCuenta) {
      return 0; // Return 0 if the data is undefined
    }
  
    return this.currentEdoCuenta.reduce((acc, item) => {
      if (item?.Estatus === 'Cancelado') {
        return acc; // Skip this item
      }
      const abono = item?.Abono ?? 0; // Default to 0 if Abono is undefined
      return acc + abono; // Accumulate the abonos
    }, 0); // Initial value is 0
  }
  

  async actualizaSaldos(refresh:boolean){
    this.estadoDeCuenta=[];
    this.estadoDeCuenta =  await firstValueFrom(this._edoCuentaService.getCuentas(this.currentHuesped.folio));  
    this.currentEdoCuenta = this.estadoDeCuenta
    this.honRefershDashboard.emit(true);
    this.cdRef.detectChanges();    
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

    // honAgregarPago(pago:edoCuenta){
    //   this.onAgregarPago.emit(pago)
    // }

    honFetchReservations(huesped:Huesped){
      this.onFetchReservations.emit(huesped);
    }

    async saldarCuenta(){
      const salidaReal = DateTime.local().setZone(this._parametrosService.getCurrentParametrosValue.codigoZona);

      const diffInDays = this._edoCuentaService.checkDifferenceInMins(this.currentHuesped.llegada, salidaReal);

      const saldoPendiente = this._edoCuentaService.calculaSaldoPendienteTarifa(
        this.currentHuesped,
        salidaReal,
        this.standardRatesArray,
        this.tempRatesArray
      );

      const abonosTotales = await this._edoCuentaService.revisaDepositoPrevio(this.currentHuesped.folio);
      const totalReal = saldoPendiente - abonosTotales.totalAbonos

      let totalTarifa = 0;

      const desglose = this.currentHuesped.desgloseEdoCuenta;
      const desgloseTyped = desglose as { tarifa: string; fecha: string; tarifaTotal: number }[];

      
      if (
        Array.isArray(desglose) &&
        desglose.length > 0 &&
        typeof desglose[0] === 'object' &&
        'tarifaTotal' in desglose[0]
      ) {
      
        if (desgloseTyped.length > diffInDays) {
          const excessDays = desgloseTyped.length - diffInDays;
          desgloseTyped.splice(-excessDays);
        }
      
        for (const item of desgloseTyped) {
          const tarifa = Number(item.tarifaTotal); // Ensure numeric
          if (!isNaN(tarifa)) {
            totalTarifa += tarifa;
          }
        }
      }
      this.updatedDesglose = desgloseTyped      
      
      const modalRef = this.modalService.open(SaldoCuentaComponent,{size:'sm' , backdrop:'static'});
      modalRef.componentInstance.folio=this.currentHuesped.folio
      modalRef.componentInstance.desgloseEdoCuenta = desgloseTyped
      modalRef.componentInstance.saldoPendiente=totalReal
      modalRef.componentInstance.pendienteHospedaje=saldoPendiente
      

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
      this.currentHuesped.desgloseEdoCuenta = this.updatedDesglose

      console.log('this.updatedDesglose', this.updatedDesglose)
      
      const sb = this._huespedService.updateEstatusHuesped(this.currentHuesped).subscribe({  
        next:(value)=>{
          this.onChangeAmaStatus.emit({cuarto:this.currentHuesped.numeroCuarto, estatus:'SUCIA'})
          this.onFetchReservations.emit();

          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='EXITO'
          modalRef.componentInstance.mensaje = 'Chek-Out Realizado con Exito '
        
          this.onActualizarCuenta.emit({alojamiento_id: this.alojamiento_id, alojamientoNuevo: this.totalAlojamientoNuevo});
          this.onCloseMainModal.emit(true);
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
    
    getDismissReason(reason: any): string {
          if (reason === ModalDismissReasons.ESC) {
              return 'by pressing ESC';
          } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
              return 'by clicking on a backdrop';
          } else {
              return  `with: ${reason}`;
          }
    }

    promptMessage(header: string, message: string, simple:boolean=false): Promise<any> {
      return new Promise((resolve, reject) => {
        const modalRef = this.modalService.open(AlertsComponent, {
          size: 'sm',
          backdrop: 'static'
        });
    
        modalRef.componentInstance.alertHeader = header;
        modalRef.componentInstance.mensaje = message;
        modalRef.componentInstance.simple = simple
    
        modalRef.result.then(
          (result) => {
            resolve(result);  // Resolve the promise with result
          },
          (reason) => {
            reject(reason);   // Reject the promise with reason
          }
        );
      });
    }

  validateCheckIn(checkInDate:string){
    if (!checkInDate || !DateTime.fromISO(checkInDate).isValid) {
      return false;
    }

    const timeZone = this._parametrosService.getCurrentParametrosValue.codigoZona;
    const tz = timeZone ?? 'America/Mexico_City';


    const checkInDateDT = DateTime.fromISO(checkInDate).setZone(tz);
    const today = DateTime.now().setZone(tz);

    return today.hasSame(checkInDateDT, 'day');

  }
    

  closeModal(){
    this.modal.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}


