import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Button, ButtonGroup, GridFeatureManager, LocaleManager, ResourceModel, ResourceTimeRangeModel, Scheduler, StringHelper, SummaryConfig
} from '@bryntum/scheduler';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { schedulerConfig } from './content.config';
import ReservationModel from './_extras/ReservationModel';
import { DaySelectorFeature } from './_extras/DailySelector';
import PropertyModel from './_extras/property.model';

@Component({
    selector      : 'app-content',
    templateUrl   : './content.component.html',
    styleUrls     : ['./content.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class ContentComponent implements AfterViewInit, OnInit {
    public schedulerConfig = schedulerConfig;

    public summaryFeatureConfig: Partial<SummaryConfig> = {
        renderer : ({ events }) => {
            const
                reservations = events as ReservationModel[],
                countButton  = this.scheduler.widgetMap['countButton'] as Button,
                result       = countButton.pressed ? reservations.length : reservations.reduce((total, reservation) => total + reservation.guests, 0);
            return StringHelper.xss`${result || ''}`;
        }
    };

    private scheduler!: Scheduler;

    // Bryntum Grid Angular wrapper reference
    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent!: BryntumSchedulerComponent;

    ngOnInit(): void {
      // Register custom DaySelectorFeature in Scheduler enabled by default
      GridFeatureManager.registerFeature(DaySelectorFeature, true, 'Scheduler');
  }

    async ngAfterViewInit(): Promise<void> {
        const
            scheduler               = this.scheduler = this.schedulerComponent.instance,
            { features, widgetMap } = scheduler,
            summaryButton           = widgetMap['summaryGroup'] as ButtonGroup,
            selectedRowButton       = widgetMap['selectedRowButton'] as Button;

        summaryButton.onClick = () => features.summary.refresh();

        selectedRowButton.onToggle = () => features.summary.selectedOnly = !features.summary.selectedOnly;

        scheduler.onBeforeEventAdd = ({ eventRecord, resourceRecords }) => {
            const
                reservation = eventRecord as ReservationModel,
                property    = resourceRecords[0] as PropertyModel;
            // reservation.pricePerNight = (scheduler.resourceTimeRangeStore as DailyRateStore)
            //     .getPricePerNightFor(property, eventRecord.startDate as Date);
        };

        await LocaleManager.applyLocale('Mx', {    
            Object : {
                newEvent : 'Guest'
            }
        });
    }

    // Create a new booking when double-clicking an available day
    async onResourceTimeRangeDblClick(event: {
        resourceTimeRangeRecord: ResourceTimeRangeModel
        resourceRecord: ResourceModel
    }): Promise<void> {
        await this.scheduler.createEvent(event.resourceTimeRangeRecord.startDate as Date, event.resourceRecord);
    }

}


