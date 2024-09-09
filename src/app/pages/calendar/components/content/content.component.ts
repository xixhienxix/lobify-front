/* eslint-disable @angular-eslint/no-output-on-prefix */

import { Component, EventEmitter,Input,  OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Internationalization } from '@syncfusion/ej2-base';
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
import { loadCldr,L10n } from '@syncfusion/ej2-base';
import { Subject, firstValueFrom } from 'rxjs';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { HouseKeeping } from '../../_models/housekeeping.model';

import * as numberingSystems from '../../../../../assets/i18/culture-files/numberingSystems.json'
import * as gregorian from '../../../../../assets/i18/culture-files/ca-gregorian.json';
import * as numbers from '../../../../../assets/i18/culture-files/numberingSystems.json';
import * as timeZoneNames from '../../../../../assets/i18/culture-files/timeZoneNames.json';
import { Bloqueo } from 'src/app/_metronic/layout/components/header/bloqueos/_models/bloqueo.model';

@Component({
    selector      : 'app-content',
    templateUrl   : './content.component.html',
    styleUrls     : ['./content.component.scss'],
    encapsulation : ViewEncapsulation.None,
    providers: [TimelineViewsService, TimelineMonthService, ResizeService, DragAndDropService],
})

export class ContentComponent implements OnInit{
  fareValue=900;
  datasourceArray :Record<string, any>[]=[]
  reservationsArray:Huesped[];
  bloqueosArray:Bloqueo[];
  @Input() allReservations:Huesped[];

  closeResult:string
  public selectedDate: Date = new Date();
  todayDate = new Date();
  public timeScale: TimeScaleModel = { enable: false, interval: 1440, slotCount: 1 };
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
  public scheduleinterval = 7;


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
    3:'#fac34e',
    4:'#DD4F5D',
    5:'#808080'

    //#fab3db - Reserva Temporal
    //#d0aaec - Reserva Uso Temporal
    //#fac34e - Reservacion
  }
  @Input() tipoHabGroupDataSource: Record<string, any>[]
  @Input() habitacionPorTipoDataSource: Record<string, any>[]
  @Input() changing: Subject<any[]>;
  @Input() roomCodesComplete:any[];
  @Input() roomCodes:Habitacion[];
  @Input() ratesArrayComplete:Tarifas[];
  @Input() estatusArray:HouseKeeping[];

  @Output() onResizeReserva: EventEmitter<Record<string, any>> = new EventEmitter();
  @Output() honEditRsv: EventEmitter<any> = new EventEmitter();
  @Output() onChangeEstatus: EventEmitter<any> = new EventEmitter();
  @Output() onRefreshingFinished: EventEmitter<boolean> = new EventEmitter();
  @Output() honNvaRsvDateRange: EventEmitter<any> = new EventEmitter();

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
  }

  async ngOnInit(){
    // this.scheduleObj.locale = 'es';

    await this.checkRoomCodesIndexDB();

    this.changing.subscribe((dataSource: any) => { 
      this.datasourceArray = [];
      this.reservationsArray = [];
      this.bloqueosArray = [];
    
      const getTimeDetails = (dateStr: string) => {
        const [hours, minutes] = dateStr.split('T')[1].split(':').map(Number);
        return { hours, minutes };
      };
    
      const getCategoryColor = (estatus: string): string => {
        const colorMap: Record<string, string> = {
          'Huesped en Casa': this.colorDict[0], // Assuming this is similar to 'Reserva en Casa'
          'Reserva Sin Pago': this.colorDict[3], // Grouped under 'Reserva'
          'Reserva Confirmada': this.colorDict[3], // Grouped under 'Reserva'
          'Deposito Realizado': this.colorDict[3], // Grouped under 'Reserva'
          'Esperando Deposito': this.colorDict[3], // Grouped under 'Reserva'
          'Totalmente Pagada': this.colorDict[3], // Grouped under 'Reserva'
          'Hizo Checkout': this.colorDict[4], // Grouped under 'Check-Out'
          'Uso Interno': this.colorDict[2],
          'Bloqueo': this.colorDict[3], // Assuming similar to 'Reserva' or could have a different color
          'Reserva Temporal': this.colorDict[1],
          'No Show': this.colorDict[4], // Grouped under 'Check-Out'
          'Check-Out': this.colorDict[4],
          'Reserva Cancelada': this.colorDict[4],
          'Walk-In': this.colorDict[0], // Assuming this is similar to 'Huesped en Casa'
          'Reserva en Casa': this.colorDict[0], // Assuming this is 'Huesped en Casa'
          'Reserva': this.colorDict[3], // Generic group for reservations
          'default': this.colorDict[0] // Default color for any unspecified status
        };
      
        return colorMap[estatus] || colorMap['default'];
      };
      
    
      dataSource.value.forEach((item: Huesped, index: number) => {
        this.reservationsArray.push(item);
          if(!reservationStatusMap[8].includes(item.estatus)){
            const { hours, minutes } = getTimeDetails(item.llegada);
            const llegada = new Date(item.llegada);
            const salida = new Date(item.salida);
        
            const pushArray = {
              Id: index + 1,   
              Subject: item.nombre,
              StartTime: new Date(llegada.setHours(hours, minutes)),
              EndTime: new Date(salida.setHours(hours, minutes)),
              IsAllDay: false,
              ProjectId: this.checkGroupId(item.habitacion),
              TaskId: this.checkTaskID(item.numeroCuarto),
              Folio: item.folio,
              Codigo: item.habitacion,
              Numero: item.numeroCuarto,
              CategoryColor: getCategoryColor(item.estatus)
            };
        
            this.datasourceArray.push(pushArray);
          }
      });
    
      console.log("Previo a Bloqueos: ", this.datasourceArray);
    
      dataSource.bloqueosArray.forEach((item: any) => {
        this.bloqueosArray.push(item);
        const { hours, minutes } = getTimeDetails(item.Desde);
        const llegada = new Date(item.Desde);
        const salida = new Date(item.Hasta);
    
        item.Cuarto.forEach((numCuarto: string, indexCuarto: number) => {
          const bloqueoObj = {
            Id: indexCuarto + 1,
            Subject: 'Bloqueo',
            StartTime: new Date(llegada.setHours(hours, minutes)),
            EndTime: new Date(salida.setHours(hours, minutes)),
            IsAllDay: true,
            ProjectId: this.checkGroupId(item.Habitacion),
            TaskId: this.checkTaskID(numCuarto),
            Folio: 'B-' + (indexCuarto + 1),
            Codigo: item.Habitacion,
            Numero: numCuarto,
            CategoryColor: this.colorDict[5]
          };
    
          this.datasourceArray.push(bloqueoObj);
        });
      });
    
      console.log("Después de Bloqueos: ", this.datasourceArray);
    
      this.refreshCalendar(this.datasourceArray);
    });
  }

  refreshCalendar(datasource:Record<string, any>[]){
    this.scheduleObj.eventSettings.dataSource = [...datasource]
    this.scheduleObj.refresh();
    this.onRefreshingFinished.emit(true);
  }

  checkGroupId(codigo:string){
    const habitacionesPorTipo = this.roomCodesComplete.find(item=>item.Codigo === codigo);
    const foundGroupID = this.tipoHabGroupDataSource.find(item=>item.text === habitacionesPorTipo?.Tipo);
    return foundGroupID?.id
  }

  checkTaskID(numero:string){
    const foundTaskID = this.habitacionPorTipoDataSource.find(item=>item.text === numero);
    return foundTaskID?.id
  }

  createRack(responseData:Habitacion[]){
    const tipoArray:Record<string, any>[] = []
    const codigoArray:Record<string, any>[] = []

    const tipoCuarto = [...new Set(responseData.map(item => item.Tipo))];
    // const codigoCuarto = [...new Set(responseData.map(item => item.Numero))];

    tipoCuarto.forEach((_item,index)=>{
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
  onPopupOpen = (args: any) => {
    // Check if the 'Folio' property exists
    args.cancel = true;

    if (args.data.hasOwnProperty("Folio")) {
      if (args.type === 'Editor' || args.type === 'QuickInfo') {
        args.cancel = true;
        this.honEditRsv.emit({ row: args, folio: args.data.Folio });
      }
    } else if (args.type === 'QuickInfo') {
      args.cancel = true;
  
      // Get current date and filter events
      const now = new Date();
      const events = this.scheduleObj.getEvents();
      const filteredEvents = events.filter(event => new Date(event.EndTime) >= now);
      
      // Check if there is an existing reservation on the same date and room
      const hasOverlap = filteredEvents.some(event =>
        event.ProjectId === args.data.ProjectId &&
        event.TaskId === args.data.TaskId &&
        new Date(event.EndTime).toISOString().split('T')[0] > new Date(args.data.startTime).toISOString().split('T')[0]
      );
  
      if (!hasOverlap) {
        const numeroCuarto = events.find(item => item.TaskId === args.data.TaskId)?.Numero;
        const codigoCuarto = this.roomCodesComplete.find(item => item.Numero === numeroCuarto)?.Codigo;
        this.honNvaRsvDateRange.emit({ data: args.data, numeroCuarto, codigoCuarto });
      }
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
  }

  onDragStop(args: DragEventArgs): void {
    //this.onResizeReserva.emit(args.data) // <-- This data is from where the event start  and i need the data to which is moved to
    const scheduleObj = (document.querySelector('.e-schedule') as any).ej2_instances[0];
    const targetElement:any = args.target;
    const rowIndex = targetElement!.parentNode!.rowIndex;
    const resourceDetails = scheduleObj.getResourcesByIndex(rowIndex);
    const Codigo = this.roomCodesComplete.find((item)=> item.Numero === resourceDetails.resourceData.text)?.Codigo
    args.data.Codigo = Codigo
    args.data.Numero = resourceDetails.resourceData.text
    this.onResizeReserva.emit(args.data)
  }

  onRenderCell(args: RenderCellEventArgs): void {
    let filteredData: any;
    if (args.elementType == 'resourceGroupCells' ) {
      
        const dataSource = Object.values(this.scheduleObj.eventSettings.dataSource!);
        filteredData = dataSource.filter((data: any) => {
            const dataDate = new Date(data.StartTime);
            const argsDate = new Date(args.date!);
            dataDate.setHours(0, 0, 0, 0);
            argsDate.setHours(0, 0, 0, 0);
            let argsGroupIndex = this.scheduleObj.getResourcesByIndex(args.groupIndex!);
             return data.ProjectId === argsGroupIndex.groupData!.ProjectId && dataDate.getTime() == argsDate.getTime(); 
        });
        (args.element as HTMLElement).innerText = filteredData.length.toString();
  }
}

isChildNode(data: any): boolean {
  return data.resourceData.ClassName !== "e-parent-node";
}

onDataBound(){

  const workCells = document.querySelectorAll(".e-work-cells.e-resource-group-cells");
  workCells.forEach((cell, index) => {
      let projectEvents = [];    
      const timestamp = Number(cell.getAttribute('data-date'));
      const startDate = new Date(timestamp);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // add one day
      const events = this.scheduleObj.getEvents(startDate, endDate);
      const cellProjectId = this.scheduleObj.getResourcesByIndex(Number(cell.getAttribute("data-group-index"))).groupData!.ProjectId;        
      //Header of avaibility
        events.forEach(event => {
            if (event.ProjectId === cellProjectId) {
                projectEvents.push(event);
            } 
        });
        const totalChildResources = this.habitacionPorTipoDataSource.filter(category => category.groupId === cellProjectId).length;
        const emptyChildResources = totalChildResources - projectEvents.length;
        (cell as HTMLElement).innerText = emptyChildResources.toString();
  });
        //Code Block for Rates on grouping column
        // this.ratesArrayComplete.map((item) => {
        //   if(item.Tarifa === 'Tarifa De Temporada'){
        //     return item.ta
        //   }
        // });
        // const newElement = document.createElement('div');
        // newElement.innerText = this.fareValue.toString();
        // newElement.style.marginTop = '10px';
        // (cell as HTMLElement).appendChild(newElement);
  }

  getIconClass(text: string) {
    let huesped

    if(this.roomCodesComplete){
      huesped = this.roomCodesComplete.find(item=>
        item.Numero === text
      );
    }

    if(huesped !== undefined){
      // return '../../../../../assets/media/locks/green_Lock.png'
      if(huesped.Estatus === 'LIMPIA'){
        return '../../../../../assets/media/locks/blue_Lock.png'
      }else if(huesped.Estatus === 'REVISAR'){
        return '../../../../../assets/media/locks/yellow_Lock.png'
      }else if(huesped.Estatus === 'SUCIA'){
        return '../../../../../assets/media/locks/red_Lock.png'
      }else if(huesped.Estatus === 'RETOCAR'){
        return '../../../../../assets/media/locks/green_Lock.png'
      }
      else {
        return '../../../../../assets/media/locks/green_Lock.png'
      }
    }
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


onStatusChange(cuarto:string, estatus:string){
  this.onChangeEstatus.emit({cuarto,estatus})
}


onEditRsv(event:any){
  this.honEditRsv.emit(event);
}

onResizeStop(args: ResizeEventArgs){

    this.onResizeReserva.emit(args.data)
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
