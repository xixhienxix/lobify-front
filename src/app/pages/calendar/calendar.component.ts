import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { WarningComponent } from './_helpers/warning.prompt.component';
import { Tarifas } from 'src/app/models/tarifas';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { Estatus } from './_models/estatus.model';
import { EstatusService } from './_services/estatus.service';
import { HuespedService } from 'src/app/services/huesped.service';
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


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  submitLoading: boolean = false
  closeResult: string
  currentFolio = ''
  stayNights: number = 1
  // eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  colorDict = {
    0: '#99d284',
    1: '#fab3db',
    2: '#d0aaec',
    3: '#fac34e'

    //#fab3db - Reserva Temporal
    //#d0aaec - Reserva Uso Temporal
    //#fac34e - Reservacion
  }
  //Models
  estatusArray: Estatus[] = []
  @Input() allReservations: Huesped[] = []
  ratesArrayComplete: Tarifas[] = [];

  promesasDisplay: boolean = false;
  onSuccessResponse: Subject<boolean> = new Subject();

  roomCodesComplete: Habitacion[];
  roomCodes: Habitacion[];
  houseKeepingCodes: HouseKeeping[] = []
  indexDbLoaded: boolean = false
  codigosCargo: Codigos[] = []

  changingValue: Subject<any> = new Subject();
  // changingPromesasValue: Subject<any> = new Subject();
  changingAdicionalesValue: Subject<Adicional[]> = new Subject();
  _isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _isRefreshing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  @ViewChild('email') emailModal: null;

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
    private _edoCuentaService: Edo_Cuenta_Service
  ) {

  }

  async ngOnInit() {
    this._huespedService.updateReservations$.subscribe({
      next: (value) => {
        if (value) {
          this.getReservations();
        }
      }
    });
    await this.checkRoomCodesIndexDB();
    await this.getReservations();
    await this.checkEstatusIndexDB();
    await this.checkAmaCodesIndexDB();
    await this.checkRatesIndexDB();
    await this.checkReservationsIndexDB();
    await this.checkCodgiosCargoIndexDB();
    this.indexDbLoaded = true;
  }

  async getReservations() {
    this._huespedService.getAll().subscribe({
      next: (value) => {
        this.allReservations = [];
        this.changingValue.next(value);
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
    const amaIndexDB: HouseKeeping[] = await this._housekeepingService.readIndexDB("houseKeeperCodes");
    /** Check if RoomsCode are on IndexDb */
    if (amaIndexDB) {
      this.houseKeepingCodes = amaIndexDB
    } else {
      this.houseKeepingCodes = await firstValueFrom(this._housekeepingService.getAll());
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

  onEditRsvOpen(data: any) {
    if (data.data.hasOwnProperty("Id")) {

      const currentHuesped = this.allReservations.find(item => item.folio === data.data.Folio)!;
      this.currentFolio = data.data.Folio;
      let colorAma = this.houseKeepingCodes.find(item =>
        item.Descripcion == currentHuesped.estatus_Ama_De_Llaves!.toUpperCase()
      )?.Color!

      const habitacion = this.roomCodesComplete.find((item) => item.Numero === data.data.Numero);

      const modalRef = this.modalService.open(EditReservaComponent, { size: 'md', backdrop: 'static' });
      modalRef.componentInstance.codigosCargo = this.codigosCargo
      modalRef.componentInstance.data = data.data
      modalRef.componentInstance.houseKeepingCodes = this.houseKeepingCodes
      modalRef.componentInstance.currentRoom = habitacion
      modalRef.componentInstance.promesasDisplay = this.promesasDisplay
      modalRef.componentInstance.estatusArray = this.estatusArray
      modalRef.componentInstance.colorAmaLlaves = colorAma
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
      })

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
      })
      // modalRef.componentInstance.onUpdateEstatusHuesped.subscribe({
      //   next: (huesped: Huesped) => {
      //     this.submitLoading = true;
      //     this._huespedService.updateEstatusHuesped(huesped).subscribe(
      //       {
      //         next: (val) => {
      //           this.promptMessage('Exito', 'Datos del huesped Actualizados');
      //         },
      //         error: (error) => {
      //           this.promptMessage('Error', 'Error al Guardar Promesa de Pago');
      //           this.promesasDisplay = false
      //         },
      //         complete: () => {
      //           this.submitLoading = false;
      //         }
      //       })
      //   }
      // });

    }
  }

  async onResizeReservation(event: Record<string, any>) {

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

  onChangedRate(data: any) {

    this._huespedService.updateReserva(data).subscribe({
      next: async (data) => {
        await this.getReservations();
        this.promptMessage('Exito', 'Reservacion actualizada con exito');
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

  async checkRatesIndexDB() {
    const ratesIndexDB: Tarifas[] = await this._habitacionService.readIndexDB("Rates");

    /** Checks if RatesArray is on IndexDb */
    if (ratesIndexDB) {
      this.ratesArrayComplete = [...ratesIndexDB]
    } else {
      this.ratesArrayComplete = await firstValueFrom(this._tarifasService.getAll());
    }
  }

  openEnviarReservacion() {
    const modalRef = this.modalService.open(this.emailModal, { size: 'md', backdrop: 'static' })
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onChangeEstatus(data: any) {
    // this.submitLoading = true;
    this._housekeepingService.updateEstatus(data.cuarto, data.estatus).subscribe({
      next: async () => {
        this.checkRoomCodesIndexDB(true);
        this.getReservations();
        //MEthod to update the locks columns
      }
    });
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

}
