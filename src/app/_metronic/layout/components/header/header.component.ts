import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
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

  eventsSubject: Subject<Huesped[]> = new Subject<Huesped[]>();
  
  @Input() allReservations:Huesped[]=[]

  constructor(
    private layout: LayoutService, 
    private router: Router, 
    private _huespedService: HuespedService, 
    private modalService:NgbModal,
    private _folioservice: FoliosService,
    private _estatusService:EstatusService,
    private _habitacionService:HabitacionesService,
    private _tarifasService:TarifasService
  ) {
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

   ngOnInit() {
    this.checkReservationsIndexDB();
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

  openNvaReserva(){
    const modalRef = this.modalService.open(NvaReservaComponent,{ size: 'lg', backdrop:'static' })  
    modalRef.componentInstance.folios = this.folios;
    modalRef.componentInstance.estatusArray = this.estatusArray
    modalRef.componentInstance.roomCodesComplete = this.roomCodesComplete
    modalRef.componentInstance.roomCodes=this.roomCodes
    modalRef.componentInstance.ratesArrayComplete = this.ratesArrayComplete
    modalRef.componentInstance.standardRatesArray = this.standardRatesArray
    modalRef.componentInstance.tempRatesArray = this.tempRatesArray
    
    modalRef.result.then((result) => {
        console.log(result)
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  
      return
  }

  submitReserva(huesped:Huesped[]){
    console.log(huesped);
  }

  async checkReservationsIndexDB(){
    const reservationsIndexDB:Huesped[] = await this._huespedService.readIndexDB("Reservations");
    /** Check if RoomsCode are on IndexDb */
    if(reservationsIndexDB){
      this.allReservations = reservationsIndexDB
    }else{
       this.allReservations = await firstValueFrom(this._huespedService.getAll());
    }
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
