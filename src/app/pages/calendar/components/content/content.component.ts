
import { Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { extend,Internationalization } from '@syncfusion/ej2-base';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import {
  ScheduleComponent, DragAndDropService, TimelineViewsService, GroupModel, EventSettingsModel, ResizeService, View, TimelineMonthService, WorkHoursModel, RenderCellEventArgs, TimeScaleModel, ActionEventArgs,
  DragEventArgs
} from '@syncfusion/ej2-angular-schedule';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { L10n } from '@syncfusion/ej2-base';

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
  @ViewChild("scheduleObj") public scheduleObj: ScheduleComponent;
  public selectedDate: Date = new Date();
  public timeScale: TimeScaleModel = { enable: true, interval: 1440, slotCount: 1 };
  /**
   * Used to Set how many days displays on the Scheduler in one view
   *
   * @type {number}
   * @memberof ContentComponent
   */
  public dayInterval: number = 5;
  /**
   * Specify WorkDays, non workdays appear as gray columns on the schedule
   *
   * @type {number[]}
   * @memberof ContentComponent
   */
  public workDays: number[] = [0, 1, 2, 3, 4, 5, 6 ,7];
  /**
   * Display Days in Specific format
   *
   * @type {Internationalization}
   * @memberof ContentComponent
   */
  public instance: Internationalization = new Internationalization();
  getDateHeaderText: Function = (value: Date) => {
      return this.instance.formatDate(value, { skeleton: 'MMMd' });
  };
  /**
   *Date interval for Scheduler
   *
   * @type {number[]}
   * @memberof ContentComponent
   */
  public datas: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  public scheduleinterval = 5;


  public rowAutoHeight = true;
  public currentView: View = 'TimelineDay';
  public allowMultiple:boolean = true;
  public group: GroupModel = {
    enableCompactView: false,
    resources: ['Type', 'Rooms']
  };

  public data: DataManager = new DataManager({
    url: environment.apiUrl+'/version',
    adaptor:new UrlAdaptor(),
    crossDomain:true
  })

  /**
   * Array of object to gruop type of data, 
   * the data is grouped by groupId in the object
   *
   * @type {Record<string, any>[]}
   * @memberof ContentComponent
   */
  tipoHabGroupDataSource: Record<string, any>[] = [
    {
      text: "Glam Camping",
      id: 1,
      color: "f855b1",
    },
    {
      color:'2a7b84',
      id:11,
      text:'Cama'
    },
    {
      text: "Casa de Verano",
      id: 21,
      color: "2f76e7",
    }
  ];
  habitacionPorTipoDataSource: Record<string, any>[] = [];

  public workHours: WorkHoursModel = { start: '08:00', end: '18:00' };

  /**
   * This Object initialize the RoomTypes, it cannot be initialize as an empty array or it will trigger a error
   * Color property is required otherwise it wont render the roomtypes
   * @type {Record<string, any>[]}
   * @memberof ContentComponent
   */
  public resourceDataSource: Record<string, any>[]
  = [    {Id: 61,   // HERE THE DATA WILL BE FILLED FROM A DB CALLBACK ID 61 its just a sample data i added to see if calendar reflects it
    Subject: 'Decoding',
    StartTime: new Date(2023, 0, 4, 9, 30),
    EndTime: new Date(2023, 0, 4, 10, 30),
    IsAllDay: false,
    ProjectId: 2,
    TaskId: 2}];


  public eventSettings: EventSettingsModel = {
    //dataSource: extend([], this.resourceDataSource.concat(this.timelineResourceData), undefined, true) as Record<string, any>[]
    dataSource: extend([], this.resourceDataSource, undefined, true) as Record<string, any>[],
  };

  constructor(private _roomsService: HabitacionesService,
    private activatedRoute: ActivatedRoute) {

    this.activatedRoute.data.subscribe((val) => {
      console.log("ROUTER DATA:-----> ",val.data);
      this.createRack(val.data);
    });
  }

  ngOnInit(){

  }

  
  
  createRack(responseData:Habitacion[]){
    const tipoArray = []
    const codigoArray = []
    
    const tipoCuarto = [...new Set(responseData.map(item => item.Tipo))];
    // const codigoCuarto = [...new Set(responseData.map(item => item.Numero))];

    for( const key in tipoCuarto) {
      tipoArray.push({ text: tipoCuarto[key], id:parseInt(key+1), color:'#' + Math.floor(Math.random()*16777215).toString(16) });
    }
    this.tipoHabGroupDataSource = tipoArray;

    for(const key in responseData)
    {
      if(responseData.hasOwnProperty(key))
        {  
          for(let x=0; x<tipoArray.length; x++){
            if(tipoArray[x].text === responseData[key].Tipo){
              codigoArray.push({ text: responseData[key].Codigo + " - " + responseData[key].Numero , id:parseInt(key+1), groupId: tipoArray[x].id, color: tipoArray[x].color}); 
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
  // public onRenderCell(args: RenderCellEventArgs): void {
  //   if (args.element.classList.contains('e-work-cells')) {
  //     if (args.date! < new Date(2021, 6, 31, 0, 0)) {
  //       args.element.setAttribute('aria-readonly', 'true');
  //       args.element.classList.add('e-read-only-cells');
  //     }
  //   }
  //   if (args.elementType === 'emptyCells' && args.element.classList.contains('e-resource-left-td')) {
  //     const target: HTMLElement = args.element.querySelector('.e-resource-text') as HTMLElement;
  //     target.innerHTML = '<div class="name">Rooms</div><div class="type">Type</div><div class="capacity">Capacity</div>';
  //   }
  // }

  /**
   * Event that triggers when popup add event window triggers, and lets you interact with popup
   * @param args This functions is to fill the dropdown of Time that appears whenever yo create or modifiy and existing reservation
   */
  onPopupOpen = (args:any) => {
    // if (args.type === 'Editor') {
    //   args.duration = 60;
    // }
    if (args.type === 'Editor' && !args.target?.classList.contains("e-appointment")) {
      args.duration = 300;
     // Set the start time to 9:00 AM
     const startTime = new Date(args.data.StartTime);
     startTime.setHours(9);
     (args.element as any).querySelector('.e-start').ej2_instances[0].value =
       startTime;
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

}
