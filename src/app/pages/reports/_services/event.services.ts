import { Injectable } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, firstValueFrom, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { PropertiesChanged } from 'src/app/models/activity-log.model';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { AuthService } from 'src/app/modules/auth';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { LogService } from 'src/app/services/activity-logs.service';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { HouseKeepingService } from 'src/app/services/housekeeping.service';
import { EMPTY_CUSTOMER, HuespedService } from 'src/app/services/huesped.service';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
    constructor(private modalService: NgbModal,
        private _indexDbService: IndexDBCheckingService,
        private _housekeepingService: HouseKeepingService,
        private _logService: LogService,
        private _authService:AuthService,
        private _huespedService:HuespedService,
        private _estadoDeCuenta:Edo_Cuenta_Service
    ) {
        this.currentUser = this._authService.getUserInfo().username
}

private ngUnsubscribe = new Subject<void>();

    closeResult:string='';
    currentUser:string='';

  private toastHandlerSubject = new Subject<boolean>();
  toastHandlerEvent$ = this.toastHandlerSubject.asObservable();  

  private reservaReportEventSubject = new Subject<Huesped>();
  reservaReportEvent$ = this.reservaReportEventSubject.asObservable();


  private prospectSubject = new Subject<Huesped>();
  editReservaEvent$ = this.prospectSubject.asObservable();

  // private reservaReportSubject = new Subject<Huesped>();
  // reservaReport$ = this.reservaReportSubject.asObservable();

  public reactivaSubject = new Subject<Huesped>();
  reactivaResercaEvent$ = this.reactivaSubject.asObservable();

  public onNvareservaSubject = new Subject<boolean>();
  onNvaReserva$ = this.onNvareservaSubject.asObservable();

  public onEstatusChangeFinished = new Subject<boolean>();
  onEstatusChangeFinished$ = this.onEstatusChangeFinished.asObservable();

  public onReportsResponse = new Subject<string>();
  onReportsUpdated$ = this.onReportsResponse.asObservable();

  emitEvent(data: any) {
    this.prospectSubject.next(data);
  }

  emitReservaReportEvent(data: any) {
    this.reservaReportEventSubject.next(data);
  }

  async onChangeEstatus(data: { cuarto: any; estatus: string }) {
    // Extract old status before making the HTTP request
    const oldStatus = this._indexDbService.getRoomCodes().find(item => item.Numero === data.cuarto)?.Estatus;
  
    try {
      // Perform the status update
      await firstValueFrom(this._housekeepingService.updateEstatus(data.cuarto, data.estatus)).then(() => {
        console.log('Log entry successfully posted.');
      })
      .catch((error) => {
        console.error('Error posting log entry:', error);
      });

      // Perform subsequent operations
      this._indexDbService.checkIndexedDB(['habitaciones'],true);
      this._indexDbService.checkIndexedDB(['reservaciones'],true);  

      // Log the status change
      this._logService.logChangeStatus(data.cuarto, data.estatus, oldStatus!, this.currentUser);
    } catch (error) {
      // Handle any errors that occur during the status update
      console.error('Error updating room status:', error);
      // Optionally log the error
    }
  }

  onChangeEstatusHuesped(huesped:Huesped){
    this._huespedService.updateEstatusHuesped(huesped).subscribe({
      next:(value)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader='EXITO'
        modalRef.componentInstance.mensaje = 'Estatus Actualizado '
      },
      error:(err)=>{
        if(err){
          const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='ERROR'
          modalRef.componentInstance.mensaje = 'No se pudo actualizar el estatus'
        
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
              }
      },
      complete:()=>{
        this.onReportsResponse.next('actualizado');
      }
    });
  }

  updateHuesped(value:any){
        const allReservations = this._indexDbService.getReservaciones();
        // this.submitLoading = true;
        const pago: edoCuenta = value.pago;

        const huesped = allReservations.find(item=> item.folio === value.updatedHuesped.folio);
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
              // allReservations = await firstValueFrom(this._huespedService.getAll(true));
              this._indexDbService.checkIndexedDB(['reservaciones'],true);
              // this.eventsSubject.next(values);
              this.promptMessage('Exito', 'Reservacion Guardada con exito');
              this.toastHandlerSubject.next(true);
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

      fillHuesped(propertiesChanged: PropertiesChanged, currentHuesped:Huesped): Huesped {
        const currentDate = new Date().toISOString(); // Use the current date-time for created and other dynamic fields
      
        return {
          folio: currentHuesped.folio,
          adultos: propertiesChanged.adultos,
          ninos: propertiesChanged.ninos,
          nombre: propertiesChanged.nombre,
          estatus: 'Reserva Sin Pago', // Example default value
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
  

  promptMessage(header:string,message:string){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje= message    
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      setTimeout(() => {
        modalRef.close('Close click');
      },4000)
      return
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
}