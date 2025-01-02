import { ChangeDetectorRef, Component,  OnInit,  ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { ParametrosService } from '../parametros/_services/parametros.service';
import { Huesped } from 'src/app/models/huesped.model';
import { EMPTY_CUSTOMER, HuespedService } from 'src/app/services/huesped.service';
import { BehaviorSubject, catchError, firstValueFrom, forkJoin, of, Subject, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { Parametros } from '../parametros/_models/parametros';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { HouseKeeping } from '../calendar/_models/housekeeping.model';
import { HouseKeepingService } from 'src/app/services/housekeeping.service';
import { CodigosService } from 'src/app/services/codigos.service';
import { Codigos } from 'src/app/models/codigos.model';
import { Estatus } from '../calendar/_models/estatus.model';
import { EstatusService } from '../calendar/_services/estatus.service';
import { Tarifas } from 'src/app/models/tarifas';
import { TarifasService } from 'src/app/services/tarifas.service';
import { EditReservasModalService } from 'src/app/services/_shared/edit.rsv.open.modal';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { LogService } from 'src/app/services/activity-logs.service';
import { AuthService } from 'src/app/modules/auth';
import { PromesaService } from 'src/app/services/promesas.service';
import { Adicional } from 'src/app/models/adicional.model';
import { AdicionalService } from 'src/app/services/adicionales.service';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { PropertiesChanged } from 'src/app/models/activity-log.model';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };

  private subscriptions: Subscription[] = [];
  private ngUnsubscribe = new Subject<void>();

  eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  _isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  changingAdicionalesValue: Subject<Adicional[]> = new Subject();
  isDataLoaded = false;
  totalRooms:number = 0;

  closeResult:string
  currentUser:string;

  allReservations:Huesped[]
  roomCodesComplete:any[]
  changingValue: Subject<any> = new Subject();
  changingValueRooms: Subject<any> = new Subject();
  parametrosModel:Parametros;
  cuentasArray:any;
  houseKeepingCodes:HouseKeeping[]=[]
  codigosCargo:Codigos[]=[]
  estatusArray:Estatus[]=[]
  ratesArrayComplete: Tarifas[] = [];
  standardRatesArray: Tarifas[] = [];
  tempRatesArray: Tarifas[] = [];
  allAccounts:edoCuenta[]=[]

  @ViewChild('modal') private modalComponent: ModalComponent;
  

  constructor(
    private _roomService: HabitacionesService,
    private _huespedService: HuespedService,
    private _parametrosService: ParametrosService,
    private _edoCuentaService: Edo_Cuenta_Service,
    private _housekeepingService: HouseKeepingService,
    private _codigosCargoService: CodigosService,
    private _estatusService: EstatusService,
    private _habitacionService: HabitacionesService,
    private _tarifasService: TarifasService,
    private _editReservaOpenModalService: EditReservasModalService,
    private modalService: NgbModal,
    private _logService:LogService,
    private _authService: AuthService,
    private _promesasService: PromesaService,
    private _adicionalService: AdicionalService,
    private cdr: ChangeDetectorRef,
    private _checkIndexDbService: IndexDBCheckingService

  ) {
    this.currentUser = this._authService.getUserInfo().username
  }

  async ngOnInit() {
    await this.checkParametrosIndexDB();
    this._isLoading.next(true);

    this._huespedService.updateReservations$.subscribe({
      next:async (value)=>{
        if(value){
          // await this.getReservations();
          await this.getReservations();
        }
      }
    });

    await this.getReservations();
    await this.checkRoomCodesIndexDB();
    await this.checkAmaCodesIndexDB();
    await this.checkCodgiosCargoIndexDB();

    this.processDashboard();

    await this.getCuentas();
    await this.checkEstatusIndexDB();
    await this.checkRatesIndexDB();
    this.reviewCheckOuts();
    this.reviewNoShow();

    this.subscriptions.push(

      this._editReservaOpenModalService.getModalOutputs().subscribe({
        next: async (output) => {
          switch (output.type) {
            // case 'onAgregarPago':
            //   this._edoCuentaService.agregarPago(output.data).subscribe({
            //     next: () => {
            //       this.promptMessage('Exito', 'Cargo agregado con exito');
            //     },
            //     error: (err) => {
            //       this.promptMessage('Error', 'No se pudo añadir el cargo, intente de nuevo más tarde');
            //     },
            //   });
            //   break;
            case 'honRefershDashboard':
                await this.getCuentas();
              break;
      
            case 'onEditRsv':
              console.log('onEditRsv');
              break;
      
            case 'onOpenEnviarReservacion':
              console.log('onOpenEnviarReservacion');
              break;
      
            case 'onGetAdicionales':
              try {
                const adicionales = await this.checkAdicionalesIndexDB();
                this.changingAdicionalesValue.next(adicionales);
              } catch (error) {
                this.promptMessage('Error', 'No se pudieron cargar los adicionales');
              }
              break;
      
            case 'onGetPromesas':
              this._promesasService.getPromesas(output.data).subscribe({
                next: (value) => {
                  // Handle success...
                },
                error: (err) => {
                  this.promptMessage('Error', 'No se pudieron cargar las promesas de pago, refresque el navegador e intente nuevamente');
                },
              });
              break;
      
            case 'onUpdateEstatusHuesped':
              console.log('onUpdateEstatusHuesped');
              break;
      
            case 'onGuardarPromesa':
              const fechaPromesa = new Date(output.data.fechaPromesaPago.year, output.data.fechaPromesaPago.month - 1, output.data.fechaPromesaPago.day);
              output.data.estatus = 'Vigente';
              this._promesasService.guardarPromesa(output.data.folio, fechaPromesa, output.data.promesaPago, output.data.estatus).subscribe({
                next: (val) => {
                  this.promptMessage('Exito', 'Promesa guardada con exito');
                },
                complete: () => {
                  this._isLoading.next(false);
                },
              });
              break;
      
            case 'onChangeAmaStatus':
              this.onChangeEstatus(output.data);
              break;
      
            case 'onEstatusChange':
              this.onEstatusChange(output.data);
              break;
      
            case 'onEstatusAplicado':
              this.promptMessage('Exito', 'Movimiento agregado al Estado de cuenta del cliente');
              this._huespedService.updateEstatusHuesped(output.data).subscribe({
                next: (value) => {
                  // this.getReservations();
                  this.getReservations();
                },
                error: (error) => {
                  this.promptMessage('Error', 'No se pudo actualizar el estatus de la Promesa');
                },
              });
              break;
      
            case 'onCheckOut':
              console.log('onCheckOut');
              break;
      
            case 'honUpdateHuesped':
              this.honUpdateHuesped(output.data);
              break;
      
            case 'onFetchReservations':
              // this.getReservations();
              await this.getReservations();
              break;
      
            case 'onActualizarCuenta':
              // this.getReservations();
              await this.getReservations();
              break;
      
            case 'onAlertMessage':
              this.promptMessage(output.data.tittle, output.data.message);
              break;
      
            default:
              console.log('Unknown output type:', output.type);
              break;
          }
        },
        error: (err) => {
          this.promptMessage('Error', 'An unexpected error occurred');
        },
        complete: () => {
          console.log('Modal output subscription completed');
        },
      })
    );
    this._isLoading.next(false);

    // this.isDataLoaded = true;
  }
  
  processDashboard() {
    forkJoin({
      parametrosModel: this._checkIndexDbService.parametros$,
      ratesIndexDB: this._checkIndexDbService.tarifas$,
      roomsCodesIndexDB: this._checkIndexDbService.habitaciones$,
      reservations: this._checkIndexDbService.reservaciones$,
      houseKeepingCodes: this._checkIndexDbService.houseKeepingCodes$,
      codigos: this._checkIndexDbService.codigos$,
      estatus: this._checkIndexDbService.estatus$
    })
    .pipe(
      tap(({parametrosModel, ratesIndexDB, roomsCodesIndexDB, reservations, houseKeepingCodes, codigos, estatus }) => {
        // Process Parametros
        this.parametrosModel = parametrosModel
        if(parametrosModel){
          this.reviewCheckOuts();
          this.reviewNoShow();
        }

        // Process Tarifa
        this.ratesArrayComplete = ratesIndexDB;
        this.standardRatesArray = ratesIndexDB.filter(item => item.Tarifa === 'Tarifa Base');
        this.tempRatesArray = ratesIndexDB.filter(item => item.Tarifa === 'Tarifa De Temporada');
        
        // Process Habitaciones
        this.roomCodesComplete = [...roomsCodesIndexDB];
        this.totalRooms = this.roomCodesComplete.length;
        this.changingValueRooms.next(this.roomCodesComplete);
        
        // Process Reservaciones
        this.allReservations = [...reservations];
        this.changingValue.next(reservations);
  
        // Process HouseKeeping
        this.houseKeepingCodes = houseKeepingCodes;
  
        // Process Codigos
        this.codigosCargo = codigos;
  
        // Process Estatus
        this.estatusArray = estatus;
        
        // Detect changes (only needed once after all updates)
        this.cdr.detectChanges();
      })
    )
    .subscribe();
  }
  

  honUpdateHuesped(value:any){
    //this.submitLoading = true;
    const pago: edoCuenta = value.pago;

    const huesped = this.allReservations.find(item=> item.folio === value.updatedHuesped.folio);
    const huespedArray = huesped ? huesped : EMPTY_CUSTOMER;
    const updatedHuesped = this.fillHuesped(value.updatedHuesped,huespedArray);

    const updatedPropertiesHuesped = value.updatedHuesped;
    const  oldPropertiesHuesped = value.oldProperties;

    const updatedProperties = this.getDifferences(oldPropertiesHuesped,updatedPropertiesHuesped);

              
      const request1 = this._huespedService.updateReserva([updatedHuesped]);
      const request2 = this._edoCuentaService.updateRowByConcepto(value.updatedHuesped.folio, 'HOSPEDAJE', pago);
      
      
      forkJoin([request1, request2])
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(async (values) => {
          console.log('Response from updateReserva:', values[0]); // Log the response to check its structure
  
          if (!values[0] || !values[0]) {
            throw new Error('Added documents not found in the response');
          }
          
          const logRequests = (values[0] || []).map((item: Huesped) =>
            this._logService.logUpdateReserva('Reserva Modificada', this.currentUser, item.folio, updatedProperties).pipe(
              catchError(error => {
                console.error(`Failed to log reservation for folio: ${item.folio}`, error);
                return of(null);
              })
            )
          );
          await firstValueFrom(forkJoin(logRequests)); // Using firstValueFrom to handle the observable
    
          // Fetch all reservations after logging
          this.allReservations = await firstValueFrom(this._huespedService.getAll(true));
          this.eventsSubject.next(values);
          this.promptMessage('Exito', 'Reservacion Guardada con exito');
          // this.submitLoading = false;
        })
      )
      .subscribe({
        error: (err) => {
          // this.isLoading = false;
            this.promptMessage('Error', 'No se pudo guardar la habitación intente de nuevo mas tarde');              
        },
      });
  
  }

  getDifferences(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    const differences: Record<string, any> = {};
  
    // Helper function to recursively get differences
    function findDifferences(innerObj1: any, innerObj2: any, path: string[] = []) {
      // Get all unique keys from both objects
      const allKeys = new Set([...Object.keys(innerObj1), ...Object.keys(innerObj2)]);
  
      allKeys.forEach(key => {
        const currentPath = [...path, key];
        const value1 = innerObj1[key];
        const value2 = innerObj2[key];
  
        if (typeof value1 === 'object' && typeof value2 === 'object' && value1 !== null && value2 !== null) {
          // Recursively find differences if both values are objects
          findDifferences(value1, value2, currentPath);
        } else if (value1 !== value2) {
          // Store only the new value if there is a difference
          differences[currentPath.join('.')] = value2;
        }
      });
    }
  
    findDifferences(obj1, obj2);
    return differences;
  }

  async checkRatesIndexDB() {
    const ratesIndexDB: Tarifas[] = await this._habitacionService.readIndexDB("Rates");

    /** Checks if RatesArray is on IndexDb */
    if (ratesIndexDB) {
      this.ratesArrayComplete = [...ratesIndexDB];

    } else {
      this.ratesArrayComplete = await firstValueFrom(this._tarifasService.getAll());
    }
  }

  async checkCodgiosCargoIndexDB() {
    const codigosCargoIndexDB: Codigos[] = await this._codigosCargoService.readIndexDB("Codes");
    /** Check if RoomsCode are on IndexDb */
    if (codigosCargoIndexDB) {
      this.codigosCargo = codigosCargoIndexDB
    } else {
      this.codigosCargo = await firstValueFrom(this._codigosCargoService.getAll());
    }
  }

  async checkEstatusIndexDB() {
    const estatusIndexDB: Estatus[] = await this._estatusService.readIndexDB("EstatusCodes");
    /** Check if RoomsCode are on IndexDb */
    if (estatusIndexDB) {
      this.estatusArray = estatusIndexDB
    } else {
      this.estatusArray = await firstValueFrom(this._estatusService.getAll());
    }
  }

  async checkAmaCodesIndexDB() {
    const amaIndexDB: HouseKeeping[] = await this._housekeepingService.readIndexDB("houseKeepingCodes");
    /** Check if RoomsCode are on IndexDb */
    if (amaIndexDB) {
      this.houseKeepingCodes = amaIndexDB
    } else {
      this.houseKeepingCodes = await firstValueFrom(this._housekeepingService.getAll());
    }
  }


  async getCuentas(){
    this._edoCuentaService.getTodasLasCuentas().subscribe({
      next:(value)=>{
        this.allAccounts = value;
        const todayDate = new Date();
        const saldoDelDia = value.filter(item => {
            // Create a new Date object for the item and normalize it
            const itemDate = new Date(item.Fecha);
            itemDate.setHours(0, 0, 0, 0);
        
            // Compare normalized dates
            return itemDate.getTime() === todayDate.getTime() && item.Abono !== 0 && item.Cargo === 0;
          });
      },
      error:()=>{
      }
  })
}

  async reviewNoShow() {
    const today = new Date();
  
    if (this.parametrosModel.noShowAutoUpdated) {
      const reservationsToUpdate = this.allReservations
        .filter(reservation => {
          const llegadaDate = new Date(reservation.llegada); // Convert 'salida' to a Date object
          return llegadaDate <= today && reservation.estatus === 'Reserva Sin Pago';
        })
        .map(reservation => {
          reservation.estatus = 'No Show';
          return reservation;
        });
  
      if (reservationsToUpdate.length > 0) {
        try {
          const updatePromises = reservationsToUpdate.map(reservation =>
            firstValueFrom(this._huespedService.updateEstatusHuesped(reservation))
          );
  
          const results = await Promise.all(updatePromises);
          if (results.every(result => result)) {
            // this.getReservations();
            await this.getReservations();
          }
        } catch (err) {
          console.error('Error updating reservations:', err);
        }
      }
    }
  }

  async reviewCheckOuts() {
    const today = new Date();
  
    if (this.parametrosModel.autoCheckOut) {
      const reservationsToUpdate = this.allReservations
        .filter(reservation => {
          const salidaDate = new Date(reservation.salida); // Convert 'salida' to a Date object
          return salidaDate <= today && reservation.estatus === 'Huesped en Casa' && reservation.pendiente === 0;
        })
        .map(reservation => {
          reservation.estatus = 'Check-Out';
          return reservation;
        });
  
      if (reservationsToUpdate.length > 0) {
        try {
          const updatePromises = reservationsToUpdate.map(reservation =>
            firstValueFrom(this._huespedService.updateEstatusHuesped(reservation))
          );
  
          const results = await Promise.all(updatePromises);
          if (results.every(result => result)) {
            await this.getReservations();
            // this.getReservations();
          }
        } catch (err) {
          console.error('Error updating reservations:', err);
        }
      }
    }
  }

  async openModal() {
    return await this.modalComponent.open();
  }

  async checkParametrosIndexDB() {
    // Attempt to read parameters from IndexDB
    const parametrosIndexDB: Parametros | null = await this._parametrosService.readIndexDB("Parametros");
  
    // Assign from IndexDB if available, otherwise fetch new parameters
    this.parametrosModel = parametrosIndexDB || await firstValueFrom(this._parametrosService.getParametros());
  }

  getReservations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._huespedService.getAll().subscribe({
        next: (value) => {
          this.allReservations = [...value];
          this.changingValue.next(value);

          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async checkRoomCodesIndexDB(refresh: boolean = false) {
    const roomsCodesIndexDB: Habitacion[] = await this._roomService.readIndexDB("Rooms");
    /** Check if RoomsCode are on IndexDb */
    
    if (roomsCodesIndexDB) {
      this.roomCodesComplete = [...roomsCodesIndexDB];
    } else {
      this.roomCodesComplete = await firstValueFrom(this._roomService.getAll());
    }
    if (refresh) {
      const roomCodes = await firstValueFrom(this._roomService.getAll());
      this.roomCodesComplete = [...roomCodes]
      this.cdr.detectChanges();
    }
    this.changingValueRooms.next(this.roomCodesComplete);
  }



  promptMessage(header: string, message: string) {
    const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje = message
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    setTimeout(() => {
      modalRef.close('Close click');
    }, 4000)
    return
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onEstatusChange(data: any) {
    if(data.estatus === 4){
      data.estatus = 'Check-Out'
    }
    data.huesped.estatus = data.estatus;
    this._huespedService.updateEstatusHuesped(data.huesped).subscribe({
      next: () => {
        // this.getReservations();
        this.getReservations();
        if (data.checkout === true) {
          this.promptMessage('Exito', 'Checkout Realizado con exito')
        }
        this._estatusService.updatedStatus.next('Check-Out');
      }
    })
  }

  async onChangeEstatus(data: { cuarto: string; estatus: string }) {
    // Extract old status before making the HTTP request
    const oldStatus = this.roomCodesComplete.find(item => item.Numero === data.cuarto)?.Estatus;
  
    try {
      // Perform the status update
      await firstValueFrom(this._housekeepingService.updateEstatus(data.cuarto, data.estatus)).then(() => {
        console.log('Estatus Changed Succesfully.');
      })
      .catch((error) => {
        console.error('Error posting log entry:', error);
      });

  
      // Perform subsequent operations
      this._checkIndexDbService.checkIndexedDB(['habitaciones'], true)
      // this.checkRoomCodesIndexDB(true);
      // this.getReservations();
      await this.getReservations();

      // Log the status change
      this._logService.logChangeStatus(data.cuarto, data.estatus, oldStatus!, this.currentUser);
    } catch (error) {
      // Handle any errors that occur during the status update
      console.error('Error updating room status:', error);
      // Optionally log the error
    }
  }

  async checkAdicionalesIndexDB() {
    const adicionalesIndexDB: Adicional[] = await this._adicionalService.readIndexDB("Adicional");
    /** Check if RoomsCode are on IndexDb */
    if (adicionalesIndexDB) {
      return adicionalesIndexDB
    } else {
      return await firstValueFrom(this._adicionalService.getAdicionales());
    }
  }

  fillHuesped(propertiesChanged: PropertiesChanged, currentHuesped:Huesped): Huesped {
    const currentDate = new Date().toISOString(); // Use the current date-time for created and other dynamic fields
  
    return {
      folio: currentHuesped.folio,
      adultos: propertiesChanged.adultos,
      ninos: propertiesChanged.ninos,
      nombre: propertiesChanged.nombre,
      estatus: currentHuesped.estatus, // Example default value
      llegada: currentHuesped.llegada, // Placeholder value, you can replace it with actual data if available
      salida: propertiesChanged.salida,
      noches: propertiesChanged.noches,
      tarifa: propertiesChanged.tarifa,
      porPagar: propertiesChanged.porPagar,
      pendiente: propertiesChanged.pendiente,
      origen: currentHuesped.origen, // Example default value
      habitacion: propertiesChanged.habitacion,
      telefono: propertiesChanged.telefono,
      email: propertiesChanged.email,
      motivo: currentHuesped.motivo, // Example default value
      fechaNacimiento: currentHuesped.fechaNacimiento, // Example default value
      trabajaEn: currentHuesped.trabajaEn, // Example default value
      tipoDeID: currentHuesped.tipoDeID, // Example default value
      numeroDeID: currentHuesped.numeroDeID, // Example default value
      direccion: currentHuesped.direccion, // Example default value
      pais: currentHuesped.pais, // Example default value
      ciudad: currentHuesped.ciudad, // Example default value
      codigoPostal: currentHuesped.codigoPostal, // Example default value
      lenguaje: currentHuesped.lenguaje, // Example default value
      numeroCuarto: propertiesChanged.numeroCuarto,
      creada: currentDate, // Set created date to current date-time
      tipoHuesped: currentHuesped.tipoHuesped, // Example default value
      notas: currentHuesped.notas, // Example default value
      vip: currentHuesped.vip, // Example default value
      ID_Socio: undefined, // Default or placeholder value
      estatus_Ama_De_Llaves: currentHuesped.estatus_Ama_De_Llaves, // Example default value
      hotel: currentHuesped.hotel // Example default value
    };
  }
}
