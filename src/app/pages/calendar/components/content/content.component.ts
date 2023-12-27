import { Component } from '@angular/core';
import { IGanttCharRow } from '../../_models/gantt-chart-row.model';
import { IGanttChartEvent } from '../../_models/gantt-chart-event.model';
import { IGanttChartMileStone } from '../../_models/gantt-chart-milestone.model';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent {
  rows: IGanttCharRow[];
constructor(){
  this.rows = [
    {name: 'Hab 1', events:  [
                      {name: 'Design sprint', startDate: new Date('2023-11-20'),  endDate: new Date('2023-12-31')} as IGanttChartEvent,    
                    ],
                      mileStones: [
                                  {name:'Feature complete', date: new Date('2023-12-24')} as IGanttChartMileStone]
    } as IGanttCharRow,
    {name:'Hab 2', events:[
                      {name: 'Carlos Arturo Martinez Farias', startDate: new Date('2023-12-28'), endDate: new Date('2023-12-29')} as IGanttChartEvent
    ],
    mileStones: [
                {name:'Feature complete', date: new Date('2023-12-24')} as IGanttChartMileStone]
    } as IGanttCharRow
  ]
}
}

