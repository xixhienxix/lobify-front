import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { catchError, firstValueFrom, forkJoin, of, Subject, tap } from 'rxjs';
import { VersionService } from 'src/app/services/version.service';
import { BloqueoReservaComponent } from '../header/bloqueos/nvo-bloqueo/nvo-bloqueo.component';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Bloqueo } from '../header/bloqueos/_models/bloqueo.model';
import { LogService } from 'src/app/services/activity-logs.service';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { CommunicationService } from 'src/app/pages/reports/_services/event.services';
import { HuespedService } from 'src/app/services/huesped.service';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Huesped } from 'src/app/models/huesped.model';
import { HouseKeepingService } from 'src/app/services/housekeeping.service';
import { AuthService } from 'src/app/modules/auth';
import { NvaReservaComponent } from '../header/reservations/nva-reserva/nva-reserva.component';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { Tarifas } from 'src/app/models/tarifas';
import { Foliador } from 'src/app/pages/calendar/_models/foliador.model';
import { FoliosService } from 'src/app/pages/calendar/_services/folios.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit{
  @Input() appFooterContainerCSSClass: string = '';

  version: string = '';
  timeStamp:string=''
  closeResult:string;
  currentUser:string;
  submitLoading:boolean=false
  folios:Foliador[]=[]

  
  roomCodesComplete:Habitacion[]=[]
  estatusArray:Estatus[]=[]
  allReservations:Huesped[]
  eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  roomCodes:Habitacion[]=[];
  ratesArrayComplete: Tarifas[] = [];
  standardRatesArray: Tarifas[] = [];
  tempRatesArray: Tarifas[] = [];

  constructor(
    private versionService: VersionService,
    private modalService: NgbModal,
    private _logService: LogService,
    private _communicationService: CommunicationService,
    private _huespedService: HuespedService, 
    private _checkIndexDbService: IndexDBCheckingService,
    private _houseKeepingService: HouseKeepingService,
    private _authService: AuthService,
    private _parametrosService:ParametrosService,
    private _folioservice: FoliosService,

  ) {
    this.currentUser = this._authService.getUserInfo().username
  }

  async ngOnInit(){
    this.versionService.getCurrentVersion().subscribe(version => {
      this.version = version;
      // const firstSplit = this.version.split(',')[1]
      // const secondSplit = firstSplit.split(':')[1].trim();
      // this.timeStamp = this.formatDate(this.parseDateFromTimestamp(secondSplit));
    });  
    this.checkFoliadorIndexDB();
    this.initArrays();
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

  initArrays() {
    forkJoin({
      rooms:this._checkIndexDbService.habitaciones$,
      estatus: this._checkIndexDbService.estatus$,
      reservations: this._checkIndexDbService.reservaciones$,
      ratesIndexDB: this._checkIndexDbService.tarifas$
    })
    .pipe(
      tap(({rooms, estatus, reservations, ratesIndexDB }) => {
        // Process Tarifa
        this.ratesArrayComplete = ratesIndexDB;
        this.standardRatesArray = ratesIndexDB.filter(item => item.Tarifa === 'Tarifa Base');
        this.tempRatesArray = ratesIndexDB.filter(item => item.Tarifa === 'Tarifa De Temporada');
        
        // Process Habitaciones
        this.roomCodesComplete = [...rooms];
   
        // Process Reservaciones
        this.allReservations = [...reservations];

  
        // Process Estatus
        this.estatusArray = estatus;
        
        // Detect changes (only needed once after all updates)
        // this.cdr.detectChanges();
      })
    )
    .subscribe();
  }

  parseDateFromTimestamp(timestamp: string): Date {
    if (!timestamp || timestamp.length !== 8) return new Date;
  
    const year = parseInt(timestamp.substring(0, 4), 10);
    const month = parseInt(timestamp.substring(4, 6), 10) - 1; // Months are 0-based
    const day = parseInt(timestamp.substring(6, 8), 10);
  
    return new Date(year, month, day);
  }

  async openNvoBloqueo(){

    const modalRef = this.modalService.open(BloqueoReservaComponent,{ size: 'md', backdrop:'static' });
    modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
    modalRef.componentInstance.estatusArray = this.estatusArray
    modalRef.componentInstance.honToastEmit.subscribe({
      next:(val:boolean)=>{
        if(val){
          this.promptMessage('Exito','Bloqueo Generado con Exito')
        }
      }
    })
    modalRef.componentInstance.honUpdateCalendar.subscribe({
      next:async (value:Bloqueo)=>{

          this._logService.logNvoBloqueo('Created Nuevo Bloqueo',this.currentUser, value).pipe(
            catchError(error => {
              // Handle error for individual log request if needed
              console.error(`Failed to log bloqueo`, error);
              return of(null); // Return a null observable to keep forkJoin working
            })
          )
          const response = this.updateDespuesDeBloqueo(value);
                      // Fetch all reservations after logging
          this.allReservations = await firstValueFrom(this._huespedService.getAll(true));
          this.eventsSubject.next(this.allReservations);
          this._communicationService.onNvareservaSubject.next(true);
        }
    })
  }

  async updateDespuesDeBloqueo(value: any): Promise<void> {
    try {
      // Fetch all reservations and trigger communication service
      // this.allReservations = await firstValueFrom(this._huespedService.getAll(true));
      // this._communicationService.onNvareservaSubject.next(true);
  
      // Wait for all 'Cuarto' status updates to finish before proceeding
      const updatePromises = value.Cuarto.map((item: string) =>
        firstValueFrom(this._houseKeepingService.updateEstatus(item, 'SUCIA'))
      );
      
      await Promise.all(updatePromises); // Wait until all updates are done
  
      // Add code here that should be executed after all updates have completed
      console.log('All room statuses updated successfully!');
      
    } catch (error) {
      console.error('Error updating reservations or status:', error);
    }
  }

  async openNvaReserva(){

    // await this.checkRatesIndexDB(true);
    this.roomCodes = Object.values(
      this.roomCodesComplete.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})); 

     const modalRef = this.modalService.open(NvaReservaComponent,{ size: 'lg', backdrop:'static' })  
     modalRef.componentInstance.folios = this.folios;
     modalRef.componentInstance.estatusArray = this.estatusArray
     modalRef.componentInstance.checkIn = this._parametrosService.getCurrentParametrosValue.checkIn
     modalRef.componentInstance.checkOut=this._parametrosService.getCurrentParametrosValue.checkOut
     modalRef.componentInstance.zona=this._parametrosService.getCurrentParametrosValue.zona
     modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
     modalRef.componentInstance.roomCodes=this.roomCodes
     modalRef.componentInstance.ratesArrayComplete = this.ratesArrayComplete
     modalRef.componentInstance.standardRatesArray = this.standardRatesArray
     modalRef.componentInstance.tempRatesArray = this.tempRatesArray
     modalRef.componentInstance.editHuesped = false;
 
 
     modalRef.componentInstance.onNvaReserva.subscribe({
       next: async (huespedArray: Huesped[]) => {
         this.submitLoading = true;
         let promptFlag = false;
     
         try {
           console.log('Processing nueva reserva...');
           
           // Call the service method
           const allReservations = await this._huespedService.processNuevaReserva(huespedArray);
     
           console.log('Successfully processed nueva reserva.');
           this.allReservations = allReservations;
           this.eventsSubject.next(allReservations);
           this._checkIndexDbService.checkIndexedDB(['folios'])
           this.promptMessage('Exito', 'Reservacion Guardada con exito');
         } catch (error) {
           console.error('Error occurred while processing nueva reserva:', error);
           this.promptMessage('Error', 'No se pudo guardar la habitación, intente de nuevo más tarde');
           promptFlag = true;
         } finally {
           this.submitLoading = false;
         }
       },
     })
     
     modalRef.result.then((result) => {
         console.log(result)
       this.closeResult = `Closed with: ${result}`;
       }, (reason) => {
           this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
       });
   
       return
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

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  

}
