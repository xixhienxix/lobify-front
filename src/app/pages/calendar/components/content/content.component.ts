
import { Component, Inject, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { extend,Internationalization } from '@syncfusion/ej2-base';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import {
  ScheduleComponent, DragAndDropService, TimelineViewsService, GroupModel, EventSettingsModel, ResizeService, View, TimelineMonthService, WorkHoursModel, RenderCellEventArgs, TimeScaleModel
} from '@syncfusion/ej2-angular-schedule';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { DataManager, UrlAdaptor } from '@syncfusion/ej2-data';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Habitacion } from 'src/app/models/habitaciones.model';

@Component({
    selector      : 'app-content',
    templateUrl   : './content.component.html',
    styleUrls     : ['./content.component.scss'],
    encapsulation : ViewEncapsulation.None,
    providers: [TimelineViewsService, TimelineMonthService, ResizeService, DragAndDropService]
})

export class ContentComponent implements OnInit{
  @ViewChild("scheduleObj") public scheduleObj: ScheduleComponent;

  public selectedDate: Date = new Date(2024,2,28);
  public timeScale: TimeScaleModel = { enable: false };
  /**
   * Used to Set how many days displays on the Scheduler in one view
   *
   * @type {number}
   * @memberof ContentComponent
   */
  public dayInterval: number = 31;
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
  tipoHabGroupDataSource: Record<string, any>[] = [];
  habitacionPorTipoDataSource: Record<string, any>[] = [];

  public workHours: WorkHoursModel = { start: '08:00', end: '18:00' };

  /**
   * This Object initialize the RoomTypes, it cannot be initialize as an empty array or it will trigger a error
   * Color property is required otherwise it wont render the roomtypes
   * @type {Record<string, any>[]}
   * @memberof ContentComponent
   */
  public resourceDataSource: Record<string, any>[]
  = [];


  public eventSettings: EventSettingsModel = {
    //dataSource: extend([], this.resourceDataSource.concat(this.timelineResourceData), undefined, true) as Record<string, any>[]
    dataSource: extend([], this.resourceDataSource, undefined, true) as Record<string, any>[],
    // fields: {
    //   id: 'Id',
    //   subject: { name: 'Subject', title: 'Summary' },
    //   location: { name: 'Location', title: 'Location' },
    //   description: { name: 'Description', title: 'Comments' },
    //   startTime: { name: 'StartTime', title: 'From' },
    //   endTime: { name: 'EndTime', title: 'To' }
    // }
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
      tipoArray.push({ text: tipoCuarto[key], id:parseInt(key+1), color: Math.floor(Math.random()*16777215).toString(16) });
    }
    this.tipoHabGroupDataSource = tipoArray;

    for(const key in responseData)
    {
      if(responseData.hasOwnProperty(key))
        {  
          for(let x=0; x<tipoArray.length; x++){
            if(tipoArray[x].text === responseData[key].Tipo){
              codigoArray.push({ text: responseData[key].Codigo + " - " + responseData[key].Numero + " - " + responseData[key].Adultos + ' + ' + responseData[key].Ninos , id:parseInt(key+1), groupId: tipoArray[x].id, color: tipoArray[x].color}); 
            }
          }
        }
    }
    this.habitacionPorTipoDataSource = codigoArray
  }


  onChange(args: ChangeEventArgs|any): void {
    this.scheduleObj.rowAutoHeight = args.checked;
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
            debugger
            let groupIndex = this.scheduleObj.getResourcesByIndex(data.ProjectId);
            let argsGroupIndex = this.scheduleObj.getResourcesByIndex(args.groupIndex!);
             return data.ProjectId === argsGroupIndex.groupData!.ProjectId && dataDate.getTime() == argsDate.getTime(); 
        });
        (args.element as HTMLElement).innerText = filteredData.length.toString();
  }
}

}
