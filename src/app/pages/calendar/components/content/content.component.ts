
import { AfterViewInit, Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { extend,Internationalization } from '@syncfusion/ej2-base';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import {
  ScheduleComponent, DragAndDropService, TimelineViewsService, GroupModel, EventSettingsModel, ResizeService, View, TimelineMonthService, WorkHoursModel, RenderCellEventArgs, TimeScaleModel, ActionEventArgs,
  DragEventArgs,
  EventRenderedArgs,
  ResizeEventArgs
} from '@syncfusion/ej2-angular-schedule';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { L10n } from '@syncfusion/ej2-base';
import { HuespedService } from 'src/app/services/huesped.service';
import { Observable, Subject, Subscription, firstValueFrom } from 'rxjs';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Huesped } from 'src/app/models/huesped.model';

L10n.load({
  'en-US': {
      'schedule': {
          'saveButton': 'Save',
          'cancelButton': 'Close',
          'deleteButton': 'Remove',
          'newEvent': 'New Reservation',
      },
  }
});
@Component({
    selector      : 'app-content',
    templateUrl   : './content.component.html',
    styleUrls     : ['./content.component.scss'],
    encapsulation : ViewEncapsulation.None,
    providers: [TimelineViewsService, TimelineMonthService, ResizeService, DragAndDropService],
})

export class ContentComponent implements OnInit{

  private eventsSubscription: Subscription;

  closeResult:string
  public selectedDate: Date = new Date();
  todayDate = new Date();
  public timeScale: TimeScaleModel = { enable: true, interval: 1440, slotCount: 1 };
  /**
   * Used to Set how many days displays on the Scheduler in one view
   */
  public dayInterval: number = 5;
  /**
   * Specify WorkDays, non workdays appear as gray columns on the schedule
   */
  public workDays: number[] = [0, 1, 2, 3, 4, 5, 6 ,7];
  /**
   * Display Days in Specific format
   */
  public instance: Internationalization = new Internationalization();
  getDateHeaderText: Function = (value: Date) => {
      return this.instance.formatDate(value, { skeleton: 'MMMd' });
  };

  public datas: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  public scheduleinterval = 5;


  public rowAutoHeight = true;
  public currentView: View = 'TimelineDay';
  public allowMultiple:boolean = true;
  public group: GroupModel = {
    resources: ['Type', 'Rooms']
  };

  public data: DataManager = new DataManager({
    url: environment.apiUrl+'/version',
    adaptor:new UrlAdaptor(),
    crossDomain:true
  })


  public workHours: WorkHoursModel = { start: '08:00', end: '18:00' };

  /**
   * This Object initialize the RoomTypes, it cannot be initialize as an empty array or it will trigger a error
   * Color property is required otherwise it wont render the roomtypes
   * @type {Record<string, any>[]}
   * @memberof ContentComponent
   */
  public resourceDataSource: Record<string, any>[]= [];

  public eventSettings: EventSettingsModel = {
    dataSource: this.resourceDataSource
  };

  /**Data Models */
  colorDict={
    0:'#99d284',
    1:'#fab3db',
    2:'#d0aaec',
    3:'#fac34e'

    //#fab3db - Reserva Temporal
    //#d0aaec - Reserva Uso Temporal
    //#fac34e - Reservacion
  }
  @Input() tipoHabGroupDataSource: Record<string, any>[]
  @Input() habitacionPorTipoDataSource: Record<string, any>[]
  @Input() changing: Subject<Record<string, any>[]>;
  @Input() roomCodesComplete:Habitacion[];
  @Input() roomCodes:Habitacion[];
  @Input() datasourceArray :Record<string, any>[]=[]
  @Input() onSavedReservation: Observable<Huesped[]>;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onResizeReserva: EventEmitter<Record<string, any>> = new EventEmitter();
  @Output() honEditRsv: EventEmitter<Huesped[]> = new EventEmitter();
  @ViewChild("scheduleObj") public scheduleObj: ScheduleComponent;

  
  constructor(
    private modalService:NgbModal,
    private activatedRoute: ActivatedRoute,
    private _roomService: HabitacionesService
  ) {
    this.selectedDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate())
    this.activatedRoute.data.subscribe((val) => {
      this.createRack(val.data);
    });
  }

  async checkRoomCodesIndexDB(){
    const roomsCodesIndexDB:Habitacion[] = await this._roomService.readIndexDB("Rooms");
        /** Check if RoomsCode are on IndexDb */
      if(roomsCodesIndexDB){
          this.roomCodesComplete = [...roomsCodesIndexDB];
          this.roomCodes = Object.values(
            roomsCodesIndexDB.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        ); 
      }else{
          this.roomCodes = await firstValueFrom(this._roomService.getAll());
          this.roomCodesComplete = [...this.roomCodes]
          this.roomCodes = Object.values(
            this.roomCodes.reduce((acc, obj) => ({ ...acc, [obj.Codigo]: obj }), {})
        );         
      }
      console.log("RoomCodeCOmplete d mmain container: ", this.roomCodesComplete)
  }

  async ngOnInit(){
    await this.checkRoomCodesIndexDB();

    this.changing.subscribe(dataSource => { 
      dataSource.forEach((item, index)=>{
        const llegada = new Date(item.llegada);
        const salida = new Date(item.salida);

        const pushArray = 
          {
            Id: index+1,   
            Subject: item.nombre,
            StartTime: new Date(llegada.getFullYear(), llegada.getMonth(), llegada.getDate(), llegada.getHours(), llegada.getMinutes()),
            EndTime: new Date(salida.getFullYear(), salida.getMonth(), salida.getDate(), salida.getHours(), salida.getMinutes()),
            IsAllDay: false,
            ProjectId: this.checkGroupId(item.habitacion),
            TaskId: this.checkTaskID(item.numeroCuarto),
            Folio: item.folio,
            Codigo: item.habitacion,
            Numero: item.numeroCuarto,
            CategoryColor:item.origen === 'Walk-In' ? this.colorDict[0] : item.origen === 'Reserva' ? this.colorDict[3] : item.origen === 'Temporal' ? this.colorDict[1] : item.origen === 'Interno' ? this.colorDict[2] : this.colorDict[3]
          }
        this.datasourceArray.push(pushArray)
      })
      this.refreshCalendar(this.datasourceArray);
    });

    // await this.checkReservationsIndexDB();
  }

  refreshCalendar(datasource:Record<string, any>[]){
    this.scheduleObj.eventSettings.dataSource = [...datasource]
  }

  checkGroupId(codigo:string){
    let codigosSet = new Set();
    const habitacionesPorTipo = this.roomCodesComplete.find(item=>item.Codigo === codigo);
    const foundGroupID = this.tipoHabGroupDataSource.find(item=>item.text === habitacionesPorTipo?.Tipo);
    return foundGroupID?.id
  }

  checkTaskID(numero:string){
    const foundTaskID = this.habitacionPorTipoDataSource.find(item=>item.text === numero);
    return foundTaskID?.id
  }


  // async checkReservationsIndexDB(){
  //   const reservationsIndexDB:Huesped[] = await this._huespedService.readIndexDB("Reservations");
  //   /** Check if RoomsCode are on IndexDb */
  //   if(reservationsIndexDB){
  //     this.reservationsArrayComplete = reservationsIndexDB;
  //   }else{
  //       this.reservationsArrayComplete = await firstValueFrom(this._huespedService.getAll());     
  //   }
  // }

  createRack(responseData:Habitacion[]){
    const tipoArray:Record<string, any>[] = []
    const codigoArray:Record<string, any>[] = []

    const tipoCuarto = [...new Set(responseData.map(item => item.Tipo))];
    // const codigoCuarto = [...new Set(responseData.map(item => item.Numero))];

    tipoCuarto.forEach((item,index)=>{
      tipoArray.push({ text: tipoCuarto[index], id:index+1, color:'#' + Math.floor(Math.random()*16777215).toString(16) });
    }) 
    // HERE THE GROUPS ARE CREATED
    this.tipoHabGroupDataSource = tipoArray;

    for(const key in responseData)
    {
      if(responseData.hasOwnProperty(key))
        {  
          for(let x=0; x<tipoArray.length; x++){
            if(tipoArray[x].text === responseData[key].Tipo){
              if(tipoArray[x].id)
              codigoArray.push({ text: responseData[key].Numero , id:Number(key)+1, groupId: tipoArray[x].id, color: tipoArray[x].color}); 
            }
          }
        }
    }
     this.habitacionPorTipoDataSource = codigoArray
  }

  onChange(args: ChangeEventArgs|any): void {
    this.scheduleObj.rowAutoHeight = args.checked;

    //Used Change Day Vie Interval Dynamicaly with dropdown
    (this.scheduleObj.views[0] as any).interval = this.scheduleinterval;
    this.scheduleObj.refresh();
  }

  /**
   * Event that triggers when popup add event window triggers, and lets you interact with popup
   * @param args This functions is to fill the dropdown of Time that appears whenever yo create or modifiy and existing reservation
   */
  onPopupOpen = (args:any) => {
   if (args.type === 'Editor' || args.type === 'QuickInfo')  {
    args.cancel = true;
    this.honEditRsv.emit(args);
    }
  }
  /**
   * This function shows how to move a reservation in an estimated time of minutes, the interval parameter determines how many in how many minutes the event will be moved when you drag it across the calendar
   *
   * @param {DragEventArgs} args
   * @memberof ContentComponent
   */
  onDragStart(args: DragEventArgs): void {
    args.interval = 30;
    console.log("Drag Start : ", args)
  }

  onDragStop(args: DragEventArgs): void {
    //this.onResizeReserva.emit(args.data) // <-- This data is from where the event start  and i need the data to which is moved to
    console.log(args.data);
    const scheduleObj = (document.querySelector('.e-schedule') as any).ej2_instances[0];
    const targetElement:any = args.target;
    const cellIndex = targetElement!.cellIndex;
    const rowIndex = targetElement!.parentNode!.rowIndex;
    const resourceDetails = scheduleObj.getResourcesByIndex(rowIndex);
    const Codigo = this.roomCodesComplete.find((item)=> item.Numero === resourceDetails.resourceData.text)?.Codigo
    args.data.Codigo = Codigo
    args.data.Numero = resourceDetails.resourceData.text
    this.onResizeReserva.emit(args.data)
    console.log('Dropped resource data:', args.data);
  }
  

  onRenderCell(args: RenderCellEventArgs): void {
    console.log("")
    let filteredData: any;
    if (args.elementType == 'resourceGroupCells' ) {
      
        const dataSource = Object.values(this.scheduleObj.eventSettings.dataSource!);
        filteredData = dataSource.filter((data: any) => {
            const dataDate = new Date(data.StartTime);
            const argsDate = new Date(args.date!);
            dataDate.setHours(0, 0, 0, 0);
            argsDate.setHours(0, 0, 0, 0);
            let groupIndex = this.scheduleObj.getResourcesByIndex(data.ProjectId);
            let argsGroupIndex = this.scheduleObj.getResourcesByIndex(args.groupIndex!);
             return data.ProjectId === argsGroupIndex.groupData!.ProjectId && dataDate.getTime() == argsDate.getTime(); 
        });
        (args.element as HTMLElement).innerText = filteredData.length.toString();
  }
}

onDataBound(event:any){
    const numberOfDaystoDisplay = 7;
    const workCells = document.querySelectorAll(".e-work-cells.e-resource-group-cells");
    workCells.forEach((cell, index) => {
        let project1Events = [];    
        const timestamp = Number(cell.getAttribute('data-date'));
        const startDate = new Date(timestamp);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // add one day
        const events = this.scheduleObj.getEvents(startDate, endDate);
        events.forEach(event => {
            if (event.ProjectId === 1) {
                project1Events.push(event);
            } 
        });
        (cell as HTMLElement).innerText = project1Events.length.toString();
        project1Events = [];
       
    });
  }

 onActionComplete(args: ActionEventArgs): void {
  if (args.requestType === 'dateNavigate') {
    const selectedDate = this.selectedDate;
      const workCells = this.scheduleObj.element.querySelectorAll('.e-work-cells');
    this.applyStylesToCells(workCells, selectedDate);
    const headerCells = this.scheduleObj.element.querySelectorAll('.e-date-header-wrap .e-header-cells');
    this.applyStylesToCells(headerCells, selectedDate);
  }
  if(args.requestType === 'eventCreated'){
    args.data
  }

}

 applyStylesToCells(cells: NodeListOf<Element>, selectedDate: Date): void {
  cells.forEach((cell: any) => {
    const cellDate = this.scheduleObj.getDateFromElement(cell);
    if (cellDate && cellDate.getDate() === selectedDate.getDate() &&
        cellDate.getMonth() === selectedDate.getMonth() &&
        cellDate.getFullYear() === selectedDate.getFullYear()) {
      cell.style.backgroundColor = 'lightgray';
    } else {
      cell.style.backgroundColor = '';
    }
  });
}


/**
 * This method is used to change the color of each event using its categoryColor
 * @param args 
 * @returns 
 */
onEventRendered(args: EventRenderedArgs): void {
  const categoryColor: string = args.data.CategoryColor as string;
  if (!args.element || !categoryColor) {
    return;
  }
  if (this.currentView === 'Agenda') {
    (args.element.firstChild as HTMLElement).style.borderLeftColor = categoryColor;
  } else {
    args.element.style.backgroundColor = categoryColor;
  }
}


onEditRsv(event:any){
  this.honEditRsv.emit(event);
}

onResizeStop(args: ResizeEventArgs){

    this.onResizeReserva.emit(args.data)
}

promptMessage(header:string,message:string, obj?:any){
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
