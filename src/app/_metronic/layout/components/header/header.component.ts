import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, catchError, concat, concatMap, firstValueFrom, forkJoin, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { LayoutService } from '../../core/layout.service';
import { MenuComponent } from '../../../kt/components';
import { ILayout, LayoutType } from '../../core/configs/config';
import { Huesped } from 'src/app/models/huesped.model';
import { HuespedService } from 'src/app/services/huesped.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { NvaReservaComponent } from './reservations/nva-reserva/nva-reserva.component';
import { FoliosService } from 'src/app/pages/calendar/_services/folios.service';
import { EstatusService } from 'src/app/pages/calendar/_services/estatus.service';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Foliador } from 'src/app/pages/calendar/_models/foliador.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { Tarifas } from 'src/app/models/tarifas';
import { TarifasService } from 'src/app/services/tarifas.service';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { LogService } from 'src/app/services/activity-logs.service';
import { AuthService } from 'src/app/modules/auth';
import { BloqueoReservaComponent } from './bloqueos/nvo-bloqueo/nvo-bloqueo.component';
import { Bloqueo } from './bloqueos/_models/bloqueo.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  private ngUnsubscribe = new Subject<void>();

  // Public props
  currentLayoutType: LayoutType | null;

  appHeaderDisplay: boolean;
  appHeaderDefaultFixedDesktop: boolean;
  appHeaderDefaultFixedMobile: boolean;

  appHeaderDefaultContainer: 'fixed' | 'fluid';
  headerContainerCssClass: string = '';
  appHeaderDefaultContainerClass: string = '';

  appHeaderDefaultStacked: boolean;

  // view
  appSidebarDefaultCollapseDesktopEnabled: boolean;
  appSidebarDisplay: boolean;
  appHeaderDefaultContent: string = '';
  appHeaderDefaulMenuDisplay: boolean;
  appPageTitleDisplay: boolean;

  //Nva Reserva 
  submitLoading:boolean=false
  closeResult:string

  /**Models  */
  estatusArray:Estatus[]=[]
  folios:Foliador[]=[]
  roomCodesComplete:Habitacion[]=[]
  roomCodes:Habitacion[]=[];
  mySet = new Set();
  availavilityCodeRooms:Habitacion[]=[]
  availavilityRooms:Habitacion[]=[]
  infoRoomsAndCodes:any=[];
  ratesArrayComplete:Tarifas[]=[]
  standardRatesArray:Tarifas[]=[]
  ratesArray:Tarifas[]=[];
  tempRatesArray:Tarifas[]=[];

  /**Flags */
  accordionDisplay="";
  isLoading:boolean=false;

  salidas:number;
  llegadas:number;
  allReservations:Huesped[]
  currentUser:string;

  eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  sendReservations: BehaviorSubject<Huesped[]> = new BehaviorSubject<Huesped[]>([]);

  constructor(
    private layout: LayoutService, 
    private router: Router, 
    private _huespedService: HuespedService, 
    private modalService:NgbModal,
    private _folioservice: FoliosService,
    private _estatusService:EstatusService,
    private _habitacionService:HabitacionesService,
    private _tarifasService:TarifasService,
    private _parametrosService:ParametrosService,
    private _estadoDeCuenta: Edo_Cuenta_Service,
    private _logService: LogService,
    private _authService: AuthService
  ) {
    this.currentUser = this._authService.getUserInfo().username
    this.routingChanges();
  }

  updateProps(config: ILayout) {
    this.appHeaderDisplay = this.layout.getProp(
      'app.header.display',
      config
    ) as boolean;
    // view
    this.appSidebarDefaultCollapseDesktopEnabled = this.layout.getProp(
      'app.sidebar.default.collapse.desktop.enabled',
      config
    ) as boolean;
    this.appSidebarDisplay = this.layout.getProp(
      'app.sidebar.display',
      config
    ) as boolean;
    this.appHeaderDefaultContent = this.layout.getProp(
      'app.header.default.content',
      config
    ) as string;
    this.appHeaderDefaulMenuDisplay = this.layout.getProp(
      'app.header.default.menu.display',
      config
    ) as boolean;
    this.appPageTitleDisplay = this.layout.getProp(
      'app.pageTitle.display',
      config
    ) as boolean;

    // body attrs and container css classes
    this.appHeaderDefaultFixedDesktop = this.layout.getProp(
      'app.header.default.fixed.desktop',
      config
    ) as boolean;
    if (this.appHeaderDefaultFixedDesktop) {
      document.body.setAttribute('data-kt-app-header-fixed', 'true');
    }

    this.appHeaderDefaultFixedMobile = this.layout.getProp(
      'app.header.default.fixed.mobile',
      config
    ) as boolean;
    if (this.appHeaderDefaultFixedMobile) {
      document.body.setAttribute('data-kt-app-header-fixed-mobile', 'true');
    }

    this.appHeaderDefaultContainer = this.layout.getProp(
      'appHeaderDefaultContainer',
      config
    ) as 'fixed' | 'fluid';
    this.headerContainerCssClass =
      this.appHeaderDefaultContainer === 'fixed'
        ? 'container-xxl'
        : 'container-fluid';

    this.appHeaderDefaultContainerClass = this.layout.getProp(
      'app.header.default.containerClass',
      config
    ) as string;
    if (this.appHeaderDefaultContainerClass) {
      this.headerContainerCssClass += ` ${this.appHeaderDefaultContainerClass}`;
    }

    this.appHeaderDefaultStacked = this.layout.getProp(
      'app.header.default.stacked',
      config
    ) as boolean;
    if (this.appHeaderDefaultStacked) {
      document.body.setAttribute('data-kt-app-header-stacked', 'true');
    }

    // Primary header
    // Secondary header
  }

  async ngOnInit() {
    this.checkFoliadorIndexDB();
    this.checkEstatusIndexDB();
    this.checkRoomCodesIndexDB();
    this.checkRatesIndexDB();

    const subscr = this.layout.layoutConfigSubject
      .asObservable()
      .subscribe((config: ILayout) => {
        this.updateProps(config);
      });
    this.unsubscribe.push(subscr);

    const layoutSubscr = this.layout.currentLayoutTypeSubject
      .asObservable()
      .subscribe((layout) => {
        this.currentLayoutType = layout;
      });
    this.unsubscribe.push(layoutSubscr);

    const reservasSubs = this._huespedService.updatedReservations$
      .asObservable()
      .subscribe((reservas)=>{
        this.sendReservations.next(reservas);
      })
    this.unsubscribe.push(reservasSubs);
  }

  async checkEstatusIndexDB(){
    const estatusCodesIndexDB:Estatus[] = await this._estatusService.readIndexDB("Rooms");
        /** Check if EstatusCodes are on IndexDb */
      if(estatusCodesIndexDB){
          this.estatusArray = estatusCodesIndexDB;

      }else{
          this.estatusArray = await firstValueFrom(this._estatusService.getAll());      

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

  async checkRatesIndexDB(){
    const ratesIndexDB:Tarifas[] = await this._habitacionService.readIndexDB("Rates");

    /** Checks if RatesArray is on IndexDb */
    if(ratesIndexDB){
      this.ratesArray = ratesIndexDB
      this.ratesArrayComplete = ratesIndexDB
      this.standardRatesArray = ratesIndexDB.filter((item)=>item.Tarifa === 'Tarifa Base');
      this.tempRatesArray = ratesIndexDB.filter((item)=>item.Tarifa === 'Tarifa De Temporada');
    }else {
      this.ratesArray = await firstValueFrom(this._tarifasService.getAll());
      this.ratesArrayComplete = await firstValueFrom(this._tarifasService.getAll());
      this.standardRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa Base');
      this.tempRatesArray = this.ratesArrayComplete.filter((item)=>item.Tarifa === 'Tarifa De Temporada');
    }
  }

  async checkParametrosIndexDB(){
    const parametrosIndexDB:Parametros = await this._parametrosService.readIndexDB("Parametros");
    if(parametrosIndexDB){
      this._parametrosService.setCurrentParametrosValue = parametrosIndexDB;
      this.openNvaReserva();
    }else {
      this._parametrosService.getParametros().subscribe({
        next:(item)=>{
          this.openNvaReserva();
        }
      });
    }
  }

  async checkParameters(){
    await this.checkParametrosIndexDB();
  }

  async openNvaReserva(){
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
      next:async (huespedArray:Huesped[])=>{
        this.submitLoading = true;
        let pago: edoCuenta[] = [];
        
        huespedArray.forEach((item) => {
          pago.push({
            Folio: item.folio,
            Forma_de_Pago: '',
            Fecha: new Date(),
            Descripcion: 'HOSPEDAJE',
            Cantidad: 1,
            Cargo: item.pendiente,
            Abono: 0,
            Total: item.pendiente,
            Estatus: 'Activo',
          });
        });
        
        let promptFlag = false;
        
        const request1 = this._huespedService.addPost(huespedArray);
        const request2 = this._estadoDeCuenta.agregarHospedaje(pago);
        
        forkJoin([request1, request2])
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(async (values) => {
            const logRequests = values[0].addedDocuments.map((item: Huesped) =>
              this._logService.logNvaReserva('Created Nueva Reserva', this.currentUser, item.folio).pipe(
                catchError(error => {
                  // Handle error for individual log request if needed
                  console.error(`Failed to log reservation for folio: ${item.folio}`, error);
                  return of(null); // Return a null observable to keep forkJoin working
                })
              )
            );
            await firstValueFrom(forkJoin(logRequests)); // Using firstValueFrom to handle the observable
      
            // Fetch all reservations after logging
            this.allReservations = await firstValueFrom(this._huespedService.getAll(true));
            this.eventsSubject.next(values);
            this.promptMessage('Exito', 'Reservacion Guardada con exito');
            this.submitLoading = false;
          })
        )
        .subscribe({
          error: () => {
            this.isLoading = false;
            if (!promptFlag) {
              this.promptMessage('Error', 'No se pudo guardar la habitación intente de nuevo mas tarde');
              promptFlag = true;
            }
          },
        });
      }
    })
    
    modalRef.result.then((result) => {
        console.log(result)
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  
      return
  }

  async openNuevoBloqueo(){

    const modalRef = this.modalService.open(BloqueoReservaComponent,{ size: 'md', backdrop:'static' });
    modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
    modalRef.componentInstance.estatusArray = this.estatusArray
    modalRef.componentInstance.honUpdateCalendar.subscribe({
      next:(value:Bloqueo)=>{
        console.log(value);
        
          this._logService.logNvoBloqueo('Created Nuevo Bloqueo',this.currentUser, value).pipe(
            catchError(error => {
              // Handle error for individual log request if needed
              console.error(`Failed to log bloqueo`, error);
              return of(null); // Return a null observable to keep forkJoin working
            })
          )
      }
    })
    


  }

  async checkRoomCodesIndexDB(){
    const roomsCodesIndexDB:Habitacion[] = await this._habitacionService.readIndexDB("Rooms");

        /** Check if RoomsCode are on IndexDb */
        if(roomsCodesIndexDB){
          this.roomCodesComplete = roomsCodesIndexDB;
          this.roomCodes = Object.values(
            roomsCodesIndexDB.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        ); 
      }else{
          this.roomCodes = await firstValueFrom(this._habitacionService.getAll());
          this.roomCodesComplete = this.roomCodes
          this.roomCodes = Object.values(
            this.roomCodes.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        );         
      }
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

  routingChanges() {
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        MenuComponent.reinitialization();
      }
    });
    this.unsubscribe.push(routerSubscription);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
