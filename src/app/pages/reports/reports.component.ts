import { Component, OnInit } from "@angular/core";
import { IndexDBCheckingService } from "src/app/services/_shared/indexdb.checking.service";
import { CommunicationService } from "./_services/event.services";
import { Habitacion } from "src/app/models/habitaciones.model";
import { Huesped } from "src/app/models/huesped.model";
import { BehaviorSubject, catchError, firstValueFrom, forkJoin, of, Subject, switchMap, takeUntil } from "rxjs";
import { Edo_Cuenta_Service } from "src/app/services/edoCuenta.service";
import { EditReservaComponent } from "../calendar/components/content/edit-reserva/edit-reserva.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LogService } from "src/app/services/activity-logs.service";
import { EstatusService } from "../calendar/_services/estatus.service";
import { EMPTY_CUSTOMER, HuespedService } from "src/app/services/huesped.service";
import { PromesaService } from "src/app/services/promesas.service";
import { AlertsMessageInterface } from "src/app/models/message.model";
import { edoCuenta } from "src/app/models/edoCuenta.model";
import { PropertiesChanged } from "src/app/models/activity-log.model";
import { AuthService } from "src/app/modules/auth";

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
  })
export class ReportsComponent implements OnInit{

    isLoading:boolean=false;
    _isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    promesasDisplay:Boolean = false;
    currentUser:string=''
    private ngUnsubscribe = new Subject<void>();


    constructor(private _indexDbService: IndexDBCheckingService,
        private communicationService: CommunicationService,
        private _edoCuentaService: Edo_Cuenta_Service,
        private _logsService: LogService,
        private modalService: NgbModal,
        private _huespedService: HuespedService,
        private _promesasService: PromesaService,
        private _authService: AuthService
    ){
        this.currentUser = this._authService.getUserInfo().username
    }

    ngOnInit(): void {
        this._indexDbService.checkIndexedDB(['reservaciones','housekeeping','codigos', 'estatus', 'tarifas', 'parametros'],true);
        this.communicationService.editReservaEvent$.subscribe(data => {
            this.onEditRsvOpen(data);
          });
    }

    async onEditRsvOpen(huesped: any) {

          const currentHuesped = huesped;

          let colorAma = this._indexDbService.getHouseKeepingCodes().find(item =>
            item.Descripcion == currentHuesped.estatus_Ama_De_Llaves!.toUpperCase()
          )?.Color!
    
          const estadoDeCuenta = await this.checkEdoCuentaClient(huesped.folio);
    
          const habitacion = this._indexDbService.getRoomCodes().find((item) => item.Numero === huesped.numeroCuarto);
    
          const modalRef = this.modalService.open(EditReservaComponent, { size: 'md', backdrop: 'static' });
          modalRef.componentInstance.codigosCargo = this._indexDbService.getCodigosCodes()
          modalRef.componentInstance.data = huesped
          modalRef.componentInstance.currentHuesped = currentHuesped
          modalRef.componentInstance.houseKeepingCodes = this._indexDbService.getHouseKeepingCodes()
          modalRef.componentInstance.currentRoom = habitacion
          modalRef.componentInstance.promesasDisplay = false
          modalRef.componentInstance.estatusArray = this._indexDbService.getEstatusCodes()
          modalRef.componentInstance.colorAmaLlaves = colorAma
          modalRef.componentInstance.ratesArrayComplete = this._indexDbService.getTarifasCodes()
          modalRef.componentInstance.roomCodesComplete = this._indexDbService.getRoomCodes()
          modalRef.componentInstance.checkIn = this._indexDbService.getParametrosModel().checkIn
          modalRef.componentInstance.checkOut= this._indexDbService.getParametrosModel().checkOut
          modalRef.componentInstance.zona= this._indexDbService.getParametrosModel().zona
          modalRef.componentInstance.estadoDeCuenta = estadoDeCuenta
          modalRef.componentInstance.isReservaCancelada = true

          console.log("Ama de Llaves-----------",this._indexDbService.getHouseKeepingCodes())
    
          //DataSource Promesas
          modalRef.componentInstance.onEstatusChange.subscribe({
            next: (value: any) => {
              this.onEstatusChange(value);
            }
          })
          modalRef.componentInstance.onChangeAmaStatus.subscribe({
            next: (value: any) => {
              this.communicationService.onChangeEstatus(value);
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
                  this.communicationService.promptMessage('Exito', 'Promesa guardada con exito');
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
              this.communicationService.promptMessage('Exito', 'Movimiento agregado al Estado de cuenta del cliente');
    
              this._huespedService.updateEstatusHuesped(value).subscribe({
                next: (value) => {
                  this._indexDbService.checkIndexedDB(['reservaciones'],true);
                },
                error: (error) => {
                  this.communicationService.promptMessage('Error', 'No se pudo actualizar el estatus de la Promesa');
                }
              }
              )
            }
          })
    
          modalRef.componentInstance.onAlertMessage.subscribe({
            next: (message: AlertsMessageInterface) => {
              this.communicationService.promptMessage(message.tittle, message.message);
            }
          })
          modalRef.componentInstance.onGetAdicionales.subscribe({
            next: async (flag: boolean) => {
              const adicionales = await this._indexDbService.checkIndexedDB(['adicionales'],true);
            //   this.changingAdicionalesValue.next(adicionales)
            }
          })
    
          //GET PROMESAS
          modalRef.componentInstance.onGetPromesas.subscribe({
            next: async (folio: string) => {
              this._promesasService.getPromesas(folio).subscribe({
                next: (value) => {
                },
                error: (err) => {
                  this.communicationService.promptMessage('Error', 'No se pudieron cargar las promesas de pago, refresque el navegador e intente nuevamente');
                }
              });
            }
          });
    
          modalRef.componentInstance.onFetchReservations.subscribe({
            next: () => {
              this._indexDbService.checkIndexedDB(['reservaciones'],true);
            },
            error: () => {
              this.communicationService.promptMessage('Error', 'No se pudo realizar el checkout intente de nuevo mas tarde');
            }
          });
    
          modalRef.componentInstance.onActualizarCuenta.subscribe({
            next: () => {
                this._indexDbService.checkIndexedDB(['reservaciones'],true);
            },
            error: () => {
              this.communicationService.promptMessage('Error', 'No se pudo actualizar el estado de cuenta del cliente');
            }
          })
    
          modalRef.componentInstance.onAgregarPago.subscribe({
            next: (val: edoCuenta) => {
              this._edoCuentaService.agregarPago(val).subscribe({
                next:()=>{
                },
                error:(err)=>{
                  this.communicationService.promptMessage('Error','No se pudo añadir el cargo intente de nuevo mas tarde')
                }
              });
            }
          })
          modalRef.componentInstance.honUpdateHuesped.subscribe({
            next:(value:any)=>{
              this._isLoading.next(true);
              const pago: edoCuenta = value.pago;
    
              const huesped = this._indexDbService.getReservaciones().find(item=> item.folio === value.updatedHuesped.folio);
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
                      this._logsService.logUpdateReserva('Reserva Modificada', this.currentUser, item.folio, updatedProperties).pipe(
                        catchError(error => {
                          console.error(`Failed to log reservation for folio: ${item.folio}`, error);
                          return of(null);
                        })
                      )
                    );
                    await firstValueFrom(forkJoin(logRequests)); // Using firstValueFrom to handle the observable
              
                    // Fetch all reservations after logging
                    // this.allReservations = await firstValueFrom(this._huespedService.getAll(true));
                    this._indexDbService.checkIndexedDB(['reservaciones'],true);
                    // this.eventsSubject.next(values);
                    this.communicationService.promptMessage('Exito', 'Reservacion Guardada con exito');
                    this._isLoading.next(false);
                  })
                )
                .subscribe({
                  error: (err) => {
                    this.isLoading = false;
                      this.communicationService.promptMessage('Error', 'No se pudo guardar la habitación intente de nuevo mas tarde');              
                  },
                });
            }
          });
        
      }

      async checkEdoCuentaClient(folio:string){
        return await firstValueFrom(this._edoCuentaService.getCuentas(folio));
      }

      onEstatusChange(data: any) {
        data.huesped.estatus = data.estatus;
        this._huespedService.updateEstatusHuesped(data.huesped).subscribe({
          next: () => {
            this._indexDbService.checkIndexedDB(['reservaciones'],true)
            if (data.checkout === true) {
              this.communicationService.promptMessage('Exito', 'Checkout Realizado con exito')
            }
          }
        })
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
    
}