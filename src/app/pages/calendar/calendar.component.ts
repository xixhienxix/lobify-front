import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { BehaviorSubject, Subject, Subscription, async, catchError, concat, firstValueFrom, forkJoin, of, switchMap, takeUntil, tap } from 'rxjs';
import { WarningComponent } from './_helpers/warning.prompt.component';
import { Tarifas } from 'src/app/models/tarifas';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { Estatus } from './_models/estatus.model';
import { EstatusService } from './_services/estatus.service';
import { EMPTY_CUSTOMER, HuespedService } from 'src/app/services/huesped.service';
import { HouseKeeping } from './_models/housekeeping.model';
import { HouseKeepingService } from 'src/app/services/housekeeping.service';
import { Huesped } from 'src/app/models/huesped.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Adicional } from 'src/app/models/adicional.model';
import { Promesa } from './_models/promesas.model';
import { PromesaService } from 'src/app/services/promesas.service';
import { AdicionalService } from 'src/app/services/adicionales.service';
import { DateTime } from 'luxon';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { MatTableDataSource } from '@angular/material/table';
import { EditReservaComponent } from './components/content/edit-reserva/edit-reserva.component';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { Codigos } from 'src/app/models/codigos.model';
import { CodigosService } from 'src/app/services/codigos.service';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { NvaReservaComponent } from 'src/app/_metronic/layout/components/header/reservations/nva-reserva/nva-reserva.component';
import { Foliador } from './_models/foliador.model';
import { FoliosService } from './_services/folios.service';
import { ParametrosService } from '../parametros/_services/parametros.service';
import { Parametros } from '../parametros/_models/parametros';
import { LogService } from 'src/app/services/activity-logs.service';
import { AuthService } from 'src/app/modules/auth';
import { PropertiesChanged } from 'src/app/models/activity-log.model';
import { Bloqueo } from 'src/app/_metronic/layout/components/header/bloqueos/_models/bloqueo.model';
import { BloqueoService } from 'src/app/services/bloqueo.service';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { CommunicationService } from '../reports/_services/event.services';
import { IddleManagerService } from 'src/app/services/_helpers/iddleService/iddle.manager.service';
import { ActivatedRoute } from '@angular/router';
import { DateHelperService } from './_services/data.service';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private idleSubscription: Subscription;

  submitLoading: boolean = false
  closeResult: string
  currentFolio = ''
  stayNights: number = 1
  // eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  folios:Foliador[]=[];
  currentParametros:Parametros
  isLoading:boolean=false;

  colorDict = {
    0: '#99d284',
    1: '#fab3db',
    2: '#d0aaec',
    3: '#fac34e',
    4: '#DD4F5D'

    //#fab3db - Reserva Temporal
    //#d0aaec - Reserva Uso Temporal
    //#fac34e - Reservacion
  }
  //Models
  estatusArray: Estatus[] = []
  @Input() allReservations: Huesped[] = []
  ratesArrayComplete: Tarifas[] = [];
  standardRatesArray:Tarifas[]=[]
  ratesArray:Tarifas[]=[];
  tempRatesArray:Tarifas[]=[];
  currentUser:string;


  promesasDisplay: boolean = false;
  onSuccessResponse: Subject<boolean> = new Subject();

  roomCodesComplete: any[];
  roomCodes: Habitacion[];
  houseKeepingCodes: HouseKeeping[] = []
  indexDbLoaded: boolean = false
  codigosCargo: Codigos[] = []
  bloqueosArray:Bloqueo[] = []
  receivedMessages: string[] = [];

  isModalOpen = false;


  changingValue: Subject<any> = new Subject();
  changingValueBloque: Subject<any> = new Subject();
  // changingPromesasValue: Subject<any> = new Subject();
  changingAdicionalesValue: Subject<Adicional[]> = new Subject();
  _isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _isRefreshing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  @ViewChild('email') emailModal: null;
  eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();

  constructor(
    private modalService: NgbModal,
    private _habitacionService: HabitacionesService,
    private _tarifasService: TarifasService,
    private _estatusService: EstatusService,
    private _huespedService: HuespedService,
    private _housekeepingService: HouseKeepingService,
    private _roomService: HabitacionesService,
    private _promesasService: PromesaService,
    private _adicionalService: AdicionalService,
    private _codigosCargoService: CodigosService,
    private _edoCuentaService: Edo_Cuenta_Service,
    private _folioservice: FoliosService,
    private _logService: LogService,
    private _authService: AuthService,
    private _estadoDeCuenta: Edo_Cuenta_Service,
    private _bloqueoService: BloqueoService,
    private _checkIndexDb: IndexDBCheckingService,
    private _communicationService: CommunicationService,
    private _IdleService: IddleManagerService,
    private route: ActivatedRoute,
    private _dateHelpers: DateHelperService
  ) {
    this.currentUser = this._authService.getUserInfo().username
    this.currentParametros = this.route.snapshot.data['data2'];
    this.roomCodesComplete = this.route.snapshot.data['roomCodes'];
  }

  async ngOnInit() {
    this._isLoading.next(true);

    this._huespedService.updateReservations$.subscribe({
      next: (value) => {
        if (value) {
          this.getReservations();
        }
      }
    });

      
    this._communicationService.onEstatusChangeFinished.subscribe({      
      next:async (item)=>{
        console.log('Bloqueo Triggered:Calendar, actualizando calendar this.getReservations()');
        if(item){
          await this.getReservations();
        }
      }
    });

    // Subscribe to idle timer events
    // this.idleSubscription = this._IdleService.idleTrigger$.subscribe(async () => {
    //   console.log('Refreshing...')
    //   // await this.getReservations();
    // });

    // // Start the idle timer (can be called globally or from the component)
    // this._IdleService.startIdleTimer();

    await this.checkFoliadorIndexDB();
    await this.checkRoomCodesIndexDB();
    await this.checkBloqueosIndexDb();
    await this.getReservations();
    await this.checkEstatusIndexDB();
    await this.checkAmaCodesIndexDB();
    await this.checkRatesIndexDB();
    await this.checkReservationsIndexDB();
    await this.checkCodgiosCargoIndexDB();
    // await this.checkParametrosIndexDB();
    this.indexDbLoaded = true;
    this._isLoading.next(false);

  }

  async getReservations() {
    this._huespedService.getAll().subscribe({
      next: async (value) => {
        this.allReservations = [];
        const bloqueosArray = await this._checkIndexDb.loadBloqueos(true);
        this.changingValue.next({value, bloqueosArray:bloqueosArray});
        this.allReservations = [...value]
      }
    });
  }

  async checkRoomCodesIndexDB(refresh: boolean = false) {
    const roomsCodesIndexDB: Habitacion[] = await this._roomService.readIndexDB("Rooms");
    /** Check if RoomsCode are on IndexDb */
    if (roomsCodesIndexDB) {
      this.roomCodesComplete = [...roomsCodesIndexDB];
      this.roomCodes = Object.values(
        roomsCodesIndexDB.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
      );
    } else {
      this.roomCodes = await firstValueFrom(this._roomService.getAll());
      this.roomCodesComplete = [...this.roomCodes]
      this.roomCodes = Object.values(
        this.roomCodes.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
      );
    }

    if (refresh) {
      this.roomCodes = await firstValueFrom(this._roomService.getAll());
      this.roomCodesComplete = [...this.roomCodes]
      this.roomCodes = Object.values(
        this.roomCodes.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
      );
    }
  }
  onRefreshingFinished(flag: boolean) {
    if (flag) {
      this._isRefreshing.next(false);
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

  async checkBloqueosIndexDb() {
    const bloqueosIndexDb: Bloqueo[] = await this._bloqueoService.readIndexDB("Bloqueos");
    /** Check if RoomsCode are on IndexDb */
    if (bloqueosIndexDb) {
      this.bloqueosArray = bloqueosIndexDb
    } else {
      this.bloqueosArray = await firstValueFrom(this._bloqueoService.getAll());
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
  

  async checkReservationsIndexDB() {
    const reservationsIndexDB: Huesped[] = await this._huespedService.readIndexDB("Reservations");
    /** Check if RoomsCode are on IndexDb */
    if (reservationsIndexDB) {
      this.allReservations = reservationsIndexDB
    } else {
      this.allReservations = await firstValueFrom(this._huespedService.getAll());
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

  async checkFoliadorIndexDB(){
    const foliosIndexDB:Foliador[] = await this._folioservice.readIndexDB("Foliosr");
        /** Check if EstatusCodes are on IndexDb */
      if(foliosIndexDB){
          this.folios = foliosIndexDB;
      }else{
          this.folios = await firstValueFrom(this._folioservice.getAll());      
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
  
  onEditRsv(data: any){
    const currentHuesped = this.allReservations.find(item => item.folio === data.folio)!;

    this._huespedService.currentHuesped$.next(currentHuesped);

    this.onEditRsvOpen(data.row);
  }

  onDeleteBloqueo(data: any){
    if (this.isModalOpen) return; // Prevent opening the modal multiple times

    this.isModalOpen = true;

    const modalRef = this.modalService.open(AlertsComponent, {size:'sm', backdrop:'static'})
    modalRef.componentInstance.alertHeader = 'Advertencia'
    modalRef.componentInstance.mensaje= 'Desea Finalizar el Bloqueo?'  

    modalRef.result.then(async (result) => {
      if (result === 'Aceptar') {
          this._bloqueoService.deleteBloqueo(data.row.data._id).subscribe({
            next:(response)=>{
              const data2 = {
                cuarto:data.row.data.Numero,
                estatus:'SUCIA'
              }
              this.onChangeEstatus(data2);
            },
            error:(err)=>{
              console.log(err);
            }
          })
      } else {
        this.closeResult = `Closed with: ${result}`;
      }
    });
                    // Handle modal close
                    modalRef.result.finally(() => {
                      this.isModalOpen = false; // Reset the state when the modal is closed
                  });

      return  
    }

  onNvaRsvDateRange(data:any){
    if (this.isModalOpen) return; // Prevent opening the modal multiple times

    this.isModalOpen = true;

      const modalRef = this.modalService.open(NvaReservaComponent,{ size: 'lg', backdrop:'static' })  
      modalRef.componentInstance.parametros = this.currentParametros
      modalRef.componentInstance.folios = this.folios;
      modalRef.componentInstance.estatusArray = this.estatusArray
      modalRef.componentInstance.checkIn = this.currentParametros.checkIn
      modalRef.componentInstance.checkOut=this.currentParametros.checkOut
      modalRef.componentInstance.zona=this.currentParametros.zona
      modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
      modalRef.componentInstance.roomCodes=this.roomCodes
      modalRef.componentInstance.ratesArrayComplete = this.ratesArrayComplete
      modalRef.componentInstance.standardRatesArray = this.standardRatesArray
      modalRef.componentInstance.tempRatesArray = this.tempRatesArray
      modalRef.componentInstance.editHuesped = true;

      /** Default Values */
      modalRef.componentInstance.numeroCuarto = data.numeroCuarto
      modalRef.componentInstance.cuarto = data.codigoCuarto
      modalRef.componentInstance.startTime = data.data.startTime
      modalRef.componentInstance.endTime = data.data.endTime
      modalRef.componentInstance.rsvFromCalendar=true


      modalRef.componentInstance.onNvaReserva.subscribe({
        next: async (huespedArray: Huesped[]) => {
          this.submitLoading = true;
          
          try {
            console.log('Processing nueva reserva...');
            
            // Call the service method
            this.allReservations = await this._huespedService.processNuevaReserva(huespedArray);
            
            console.log('Successfully processed nueva reserva.');
            this.eventsSubject.next(this.allReservations);
            this._checkIndexDb.checkIndexedDB(['folios']);
            this.promptMessage('Exito', 'Reservacion Guardada con exito');
          } catch (error) {
            console.error('Error occurred while processing nueva reserva:', error);
            this.promptMessage('Error', 'No se pudo guardar la habitación, intente de nuevo más tarde');
          } finally {
            this.submitLoading = false;
          }
        },
      });
              // Handle modal close
              modalRef.result.finally(() => {
                this.isModalOpen = false; // Reset the state when the modal is closed
            });

      
      
  }

  refreshCalendarData(value:boolean){
    if(value){
      this.getReservations();
    }
  }

  async checkEdoCuentaClient(folio:string){
    return await firstValueFrom(this._edoCuentaService.getCuentas(folio));
  }

  async onEditRsvOpen(data: any) {
    if (this.isModalOpen) return; // Prevent opening the modal multiple times

    if (data.data.hasOwnProperty("Id") && data.data.Subject !== 'Bloqueo') {
      this.isModalOpen = true;

      const folio = data.data.Folio
      const currentHuesped = this.allReservations.find(item => item.folio === data.data.Folio)!;
      this.currentFolio = data.data.Folio;
      let colorAma = this.houseKeepingCodes.find(item =>
        item.Descripcion == currentHuesped.estatus_Ama_De_Llaves!.toUpperCase()
      )?.Color!

      const estadoDeCuenta = await this.checkEdoCuentaClient(folio);

      const habitacion = this.roomCodesComplete.find((item) => item.Numero === data.data.Numero);

      const modalRef = this.modalService.open(EditReservaComponent, { size: 'md', backdrop: 'static' });  
      modalRef.componentInstance.codigosCargo = this.codigosCargo
      modalRef.componentInstance.parametros = this.currentParametros
      modalRef.componentInstance.data = data.data
      modalRef.componentInstance.houseKeepingCodes = this.houseKeepingCodes
      modalRef.componentInstance.currentRoom = habitacion
      modalRef.componentInstance.promesasDisplay = this.promesasDisplay
      modalRef.componentInstance.estatusArray = this.estatusArray
      modalRef.componentInstance.colorAmaLlaves = colorAma
      modalRef.componentInstance.ratesArrayComplete = this.ratesArrayComplete
      modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
      modalRef.componentInstance.checkIn = this.currentParametros.checkIn
      modalRef.componentInstance.checkOut=this.currentParametros.checkOut
      modalRef.componentInstance.zona=this.currentParametros.zona
      modalRef.componentInstance.estadoDeCuenta = estadoDeCuenta

      //DataSource Promesas
      modalRef.componentInstance.onEstatusChange.subscribe({
        next: (value: any) => {
          this.onEstatusChange(value);
        }
      })
      modalRef.componentInstance.onChangeAmaStatus.subscribe({
        next: (value: any) => {
          this.onChangeEstatus(value);
        }
      })
      modalRef.componentInstance.onGuardarPromesa.subscribe({
        next: (promesa: any) => {
          const fechaPromesa = new Date(promesa.fechaPromesaPago.year, promesa.fechaPromesaPago.month - 1, promesa.fechaPromesaPago.day)
          this._isLoading.next(true);
          promesa.estatus = 'Vigente'
          this._promesasService.guardarPromesa(promesa.folio, fechaPromesa, promesa.promesaPago, promesa.estatus).subscribe({
            next: (val) => {
              this.promesasDisplay = true
              // this.onSuccessResponse.next(true);
              this.promptMessage('Exito', 'Promesa guardada con exito');
              // this._isLoading.next(false);
            },
            complete: () => {
              this._isLoading.next(false);
            }
          })
        }
      });

      modalRef.componentInstance.onEstatusAplicado.subscribe({
        next: (value: any) => {
          this.promptMessage('Exito', 'Movimiento agregado al Estado de cuenta del cliente');

          this._huespedService.updateEstatusHuesped(value).subscribe({
            next: (value) => {
              this.getReservations();
            },
            error: (error) => {
              this.promptMessage('Error', 'No se pudo actualizar el estatus de la Promesa');
            }
          }
          )
        }
      })

      modalRef.componentInstance.onAlertMessage.subscribe({
        next: (message: AlertsMessageInterface) => {
          this.promptMessage(message.tittle, message.message);
        }
      })
      modalRef.componentInstance.onGetAdicionales.subscribe({
        next: async (flag: boolean) => {
          const adicionales = await this.checkAdicionalesIndexDB();
          this.changingAdicionalesValue.next(adicionales)
        }
      })

      //GET PROMESAS
      modalRef.componentInstance.onGetPromesas.subscribe({
        next: async (folio: string) => {
          this._promesasService.getPromesas(folio).subscribe({
            next: (value) => {
            },
            error: (err) => {
              this.promptMessage('Error', 'No se pudieron cargar las promesas de pago, refresque el navegador e intente nuevamente');
            }
          });
        }
      });

      modalRef.componentInstance.onFetchReservations.subscribe({
        next: () => {
          this.getReservations();
        },
        error: () => {
          this.promptMessage('Error', 'No se pudo realizar el checkout intente de nuevo mas tarde');
        }
      });

      modalRef.componentInstance.onActualizarCuenta.subscribe({
        next: () => {
          this.getReservations();
        },
        error: () => {
          this.promptMessage('Error', 'No se pudo actualizar el estado de cuenta del cliente');
        }
      })

      modalRef.componentInstance.onAgregarPago.subscribe({
        next: (val: edoCuenta) => {
          this._edoCuentaService.agregarPago(val).subscribe({
            next:()=>{
            },
            error:(err)=>{
              this.promptMessage('Error','No se pudo añadir el cargo intente de nuevo mas tarde')
            }
          });
        }
      });

      modalRef.componentInstance.onCloseMainModal.subscribe({
        next: (val: any) => {
          modalRef.close();
        }
      });

      modalRef.componentInstance.honUpdateHuesped.subscribe({
        next:(value:any)=>{
          this.submitLoading = true;
          const pago: edoCuenta = value.pago;

          const huesped = this.allReservations.find(item=> item.folio === value.updatedHuesped.folio);
          const huespedArray = huesped ? huesped : EMPTY_CUSTOMER;
          const updatedHuesped = this.fillHuesped(value.updatedHuesped,huespedArray);

          const updatedPropertiesHuesped = value.updatedHuesped;
          const  oldPropertiesHuesped = value.oldProperties;

          const updatedProperties = this.getDifferences(oldPropertiesHuesped,updatedPropertiesHuesped);

                    
            const request1 = this._huespedService.updateReserva([updatedHuesped]);
            const request2 = this._estadoDeCuenta.updateRowByConcepto(value.updatedHuesped.folio, 'HOSPEDAJE', pago);
            
            
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
                this.submitLoading = false;
                modalRef.close();
              })
            )
            .subscribe({
              error: (err) => {
                this.isLoading = false;
                  this.promptMessage('Error', 'No se pudo guardar la habitación intente de nuevo mas tarde');              
              },
            });
        }
      });
                    // Handle modal close
                    modalRef.result.finally(() => {
                      this.isModalOpen = false; // Reset the state when the modal is closed
                  });
    }
  }

  async onResizeReservation(event: Record<string, any>) {
    let arrayToCheck = []
    if(event.Subject === 'Bloqueo'){
      arrayToCheck = this.bloqueosArray
    }else{
      arrayToCheck = this.allReservations
    }

    if(event.Codigo === undefined){
      return;
    }

    if(!this.checkValidResize(event, arrayToCheck)){
        const dataSource = await this.roomRates(event.Codigo);
        const tarifaEstandarArray = dataSource.filter((item: any) => item.Tarifa === 'Tarifa Base');
        const tempRatesArray = dataSource.filter((item: any) => item.Tarifa === 'Tarifa De Temporada');
        const huesped = this.allReservations.find(item => item.folio === event.Folio);
    
        let Difference_In_Time = event.EndTime.getTime() - event.StartTime.getTime();
        const stayNights = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
    
        const modalRef = this.modalService.open(WarningComponent, { size: 'md', backdrop: 'static' })
        modalRef.componentInstance.ratesArrayComplete = dataSource
        modalRef.componentInstance.stayNights = stayNights
        modalRef.componentInstance.StartTime = event.StartTime
        modalRef.componentInstance.EndTime = event.EndTime
    
        modalRef.componentInstance.Adultos = huesped?.adultos
        modalRef.componentInstance.Ninos = huesped?.ninos
        modalRef.componentInstance.parametros = this.currentParametros
        modalRef.componentInstance.tarifaEstandarArray = tarifaEstandarArray
        modalRef.componentInstance.tempRatesArray = tempRatesArray
        modalRef.componentInstance.cuarto = event.Codigo
        modalRef.componentInstance.folio = event.Folio
        modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
        modalRef.componentInstance.numeroCuarto = event.Numero
        modalRef.componentInstance.alertHeader = "Advertencia"
        modalRef.componentInstance.mensaje = "Al cambiarse la fecha de la reservacion es nesesario confirmar la tarifa que se utilizara para la misma. "
        modalRef.result.then(async (result) => {
        if (result) {
          this.onChangedRate(result);
        } else {
          this.closeResult = `Closed with: ${result}`;
        }
        await this.getReservations();
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }

  checkValidResize(searchObj: any, dataArray: (Bloqueo | Huesped)[]): any | null {
    return dataArray.find(item => {
      // Check for Bloqueo type
      if ('Desde' in item && 'Hasta' in item) {
        const startDateMatches = this.compareDates(new Date(searchObj.StartTime), new Date(item.Desde));
        const endDateMatches = this.compareDates(new Date(searchObj.EndTime), new Date(item.Hasta));
        return item.Habitacion === searchObj.Codigo && startDateMatches && endDateMatches;
      }
  
      // Check for Huesped type
      if ('llegada' in item && 'salida' in item) {
        const startDateMatches = this.compareDates(new Date(searchObj.StartTime), new Date(item.llegada));
        const endDateMatches = this.compareDates(new Date(searchObj.EndTime), new Date(item.salida));
        return item.habitacion === searchObj.Codigo && startDateMatches && endDateMatches;
      }
  
      return false;
    });
  }

  compareDates(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  onChangedRate(data: any) {

    this._huespedService.updateReservaResize(data).subscribe({
      next: async (resultData) => {
          this._edoCuentaService.actualizaSaldo(data.folio,data.totalSeleccionado).subscribe({
            next:async (value)=>{
              if(value){
                await this.getReservations();
                this.promptMessage('Exito', 'Reservacion actualizada con exito');
              }
            },
            error:(err)=>{
              this.promptMessage('Error', 'No se pudo actualizar la nueva fecha vuelva intentarlo')
            }
          })
      },
      error: () => {
        this.promptMessage('Error', 'No se pudo actualizar la nueva fecha vuelva intentarlo')
      },
      complete: () => {
        this.submitLoading = false
      }
    })
  }

  async roomRates(minihabs: string) {
    const tarifasDisponibles = [...this.ratesArrayComplete]

    let availbleRates = tarifasDisponibles.filter((item) => item.Estado === true);

    availbleRates = availbleRates.filter(obj =>
      obj.Habitacion.some(item => item === minihabs));
    return availbleRates
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

  fillHuesped(propertiesChanged: PropertiesChanged, currentHuesped:Huesped): Huesped {
    const currentDate = new Date().toISOString(); // Use the current date-time for created and other dynamic fields
  
    return {
      folio: currentHuesped.folio,
      adultos: propertiesChanged.adultos,
      ninos: propertiesChanged.ninos,
      nombre: propertiesChanged.nombre,
      estatus: currentHuesped.estatus, // Example default value
      llegada: propertiesChanged.llegada, // Placeholder value, you can replace it with actual data if available
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

  async checkRatesIndexDB() {
    const ratesIndexDB: Tarifas[] = await this._habitacionService.readIndexDB("Rates");

    /** Checks if RatesArray is on IndexDb */
    if (ratesIndexDB) {
      this.ratesArrayComplete = [...ratesIndexDB];
      this.standardRatesArray = ratesIndexDB.filter((item)=>item.Tarifa === 'Tarifa Base');
      this.tempRatesArray = ratesIndexDB.filter((item)=>item.Tarifa === 'Tarifa De Temporada');
    } else {
      this.ratesArray = await firstValueFrom(this._tarifasService.getAll());
      this.ratesArrayComplete = await firstValueFrom(this._tarifasService.getAll());
      this.standardRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa Base');
      this.tempRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa De Temporada');    }
  }

  openEnviarReservacion() {
    const modalRef = this.modalService.open(this.emailModal, { size: 'md', backdrop: 'static' })
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  async onChangeEstatus(data: { cuarto: string; estatus: string }) {

    // Extract old status before making the HTTP request
    const oldStatus = this.roomCodesComplete.find(item => item.Numero === data.cuarto)?.Estatus;
  
    try {
      // Perform the status update
      await firstValueFrom(this._housekeepingService.updateEstatus(data.cuarto, data.estatus)).then(() => {
        console.log('Log entry successfully posted.');
      })
      .catch((error) => {
        console.error('Error posting log entry:', error);
      });

  
      // Perform subsequent operations
      this.checkRoomCodesIndexDB(true);
      this.getReservations();
  
      // Log the status change
      this._logService.logChangeStatus(data.cuarto, data.estatus, oldStatus!, this.currentUser);
    } catch (error) {
      // Handle any errors that occur during the status update
      console.error('Error updating room status:', error);
      // Optionally log the error
    }
  }

  onEstatusChange(data: any) {
    data.huesped.estatus = data.estatus;
    this._huespedService.updateEstatusHuesped(data.huesped).subscribe({
      next: () => {
        this.getReservations();
        if (data.checkout === true) {
          this.promptMessage('Exito', 'Checkout Realizado con exito')
        }
      }
    })
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

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

}
