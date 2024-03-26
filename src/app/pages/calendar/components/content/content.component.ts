
import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import {
  ScheduleComponent, DragAndDropService, TimelineViewsService, GroupModel, EventSettingsModel, ResizeService, View, TimelineMonthService
} from '@syncfusion/ej2-angular-schedule';
import { roomData } from './_data/data';
import { HabitacionesService } from 'src/app/services/habitaciones.service';

@Component({
    selector      : 'app-content',
    templateUrl   : './content.component.html',
    styleUrls     : ['./content.component.scss'],
    encapsulation : ViewEncapsulation.None,
    providers: [TimelineViewsService, TimelineMonthService, ResizeService, DragAndDropService]
})

export class ContentComponent {
  @ViewChild('scheduleObj') public scheduleObj: ScheduleComponent;
  public selectedDate: Date = new Date();
  public rowAutoHeight = true;
  public currentView: View = 'TimelineWeek';
  public group: GroupModel = {
    enableCompactView: false,
    resources: ['Room']
  };
  public allowMultiple = true;
  public resourceDataSource: Record<string, any>[] = [
    // { text: 'Room A', id: 1, color: '#98AFC7' },
    // { text: 'Room B', id: 2, color: '#99c68e' },
  ];

  public eventSettings: EventSettingsModel = {
    dataSource: extend([], roomData, undefined, true) as Record<string, any>[],
    fields: {
      id: 'Id',
      subject: { name: 'Subject', title: 'Summary' },
      location: { name: 'Location', title: 'Location' },
      description: { name: 'Description', title: 'Comments' },
      startTime: { name: 'StartTime', title: 'From' },
      endTime: { name: 'EndTime', title: 'To' }
    }
  };

  constructor(private _roomsService: HabitacionesService) {
    this._roomsService.getCodigohabitaciones().subscribe({
      next :(responseData)=>{
         const postArray = []
         for(const key in responseData)
         {
           if(responseData.hasOwnProperty(key))
           postArray.push({ text: responseData[key], id:parseInt(key+1), color: '#98AFC7'});// without color it paint nothing
          }
          this.resourceDataSource = postArray
    
      }
    })

  }

  onChange(args: ChangeEventArgs|any): void {
    this.scheduleObj.rowAutoHeight = args.checked;
  }

}


