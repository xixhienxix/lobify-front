import {
    DateHelper, DomHelper, EventHelper, EventModel, InstancePlugin, ResourceModel, ResourceTimeRangeModel,
    ResourceTimeRangeStore, Scheduler, Tooltip
} from '@bryntum/scheduler';
import { DailyRateModel } from './DailyRateStore';

/**
 * Custom feature that allows drag selecting a range of days to create a reservation.
 */

// Define reservation type
type ReservationType = {
    totalPrice?: number
    dragStarted?: boolean
    valid?: boolean
    nights: number
    startX: number
    resource: ResourceModel
    mouseDownDate: string | Date
    startDate: string | Date
    endDate: string | Date
} | null

export class DaySelectorFeature extends InstancePlugin {
    static $name = 'DaySelector';

    private tooltip: Tooltip | null     = null;
    public reservation: ReservationType = null;

    // Hook up a mouse down listener at construction time
    override construct(client: Scheduler, config: object) {
        super.construct(client, config);
        client.on('resourceTimeRangeMouseDown', this.onResourceTimeRangeMouseDown, this);
    }

    // User moused down on an "empty" part of the schedule
    onResourceTimeRangeMouseDown({ resourceRecord, resourceTimeRangeRecord, domEvent }: {
        resourceRecord: ResourceModel
        resourceTimeRangeRecord: ResourceTimeRangeModel
        domEvent: MouseEvent
    }) {
        if (resourceTimeRangeRecord) {
            const
                { client : scheduler } = this,
                startDate              = resourceTimeRangeRecord.startDate,
                endDate                = resourceTimeRangeRecord.endDate;

            // Initiate a new reservation
            this.reservation = {
                startX        : domEvent.clientX,
                resource      : resourceRecord,
                mouseDownDate : startDate,
                startDate     : endDate,
                endDate       : resourceTimeRangeRecord.endDate,
                nights        : DateHelper.getDurationInUnit(startDate as Date, endDate as Date, 'days')
            };

            (domEvent.target! as Element).closest('.b-sch-resourcetimerange')?.classList.add('b-selected', 'b-first', 'b-last');

            scheduler.element.classList.add('b-reserving-dates');

            scheduler.on('resourceTimeRangeMouseOver', this.onDayMouseOver, this);

            EventHelper.on({
                mouseup : 'onMouseUp',
                element : document,
                once    : true,
                thisObj : this
            });
        }
    }

    // Mouse over a new element in the schedule
    async onDayMouseOver({ resourceTimeRangeRecord, domEvent }: { resourceTimeRangeRecord: ResourceTimeRangeModel; domEvent: MouseEvent }) {
        const
            { reservation }   = this,
            scheduler         = this.client as Scheduler,
            mouseDownDate     = reservation?.mouseDownDate,
            resource          = reservation?.resource,
            startX            = reservation?.startX,
            startDate         = DateHelper.min(resourceTimeRangeRecord.startDate as Date, mouseDownDate as Date),
            endDate           = DateHelper.max(resourceTimeRangeRecord.endDate as Date, mouseDownDate as Date),
            dayRangeInstances = (scheduler.resourceTimeRangeStore as ResourceTimeRangeStore).getRanges({
                resourceRecord : resource!,
                startDate,
                endDate
            });

        if (reservation) {
            Object.assign(reservation, {
                startDate,
                endDate,
                dayRangeInstances,
                nights     : DateHelper.getDurationInUnit(startDate, endDate, 'days'),
                totalPrice : dayRangeInstances.reduce((pre, day) => pre + (day as DailyRateModel).pricePerNight, 0)
            });
        }

        const events = scheduler.eventStore.getEvents({ resourceRecord : resource, startDate, endDate }) as EventModel[];

        // Prevent booking over gaps or existing bookings in the schedule
        if (reservation) {
            reservation.valid = dayRangeInstances.length >= reservation.nights && !events.length;
            scheduler.element.classList.toggle('b-invalid-reservation', !reservation.valid);
        }

        //Removes the passed CSS classes from all descendants of the passed element.
        DomHelper.removeClsGlobally(scheduler.element, 'b-selected');

        dayRangeInstances.forEach((range, i) => {
            const element = scheduler.getElementFromResourceTimeRangeRecord(range);
            element.classList.add('b-selected');
            element.classList.toggle('b-first', i === 0);
            element.classList.toggle('b-last', i === dayRangeInstances.length - 1);
        });

        let tooltip = this.tooltip;

        if (Math.abs(domEvent.clientX - startX!) > 10 && !tooltip) {
            tooltip = this.tooltip = new Tooltip({
                rootElement : document.body, // Floating Widgets must have "rootElement" to be assigned to a float root
                cls         : 'b-dayselector-tip',
                align       : 'b-t',
                html        : '1 night'
            });
            await tooltip.show();
        }

        if (tooltip) {
            tooltip.alignTo(scheduler.getElementFromResourceTimeRangeRecord(dayRangeInstances[dayRangeInstances.length - 1]));
            tooltip.html = reservation?.valid
                ? `${reservation.nights} night${reservation.nights as number > 1 ? 's' : ''}, $${reservation.totalPrice}`
                : 'Invalid reservation';
        }
    }

    // Mouse up anywhere
    onMouseUp() {
        const
            { reservation } = this,
            scheduler       = this.client as Scheduler,
            resource        = reservation?.resource;

        scheduler.un('resourceTimeRangeMouseOver', this.onDayMouseOver, this);
        scheduler.element.classList.remove('b-reserving-dates');
        //Removes the passed CSS classes from all descendants of the passed element.
        DomHelper.removeClsGlobally(scheduler.element, 'b-selected');

        this.tooltip?.destroy();
        this.tooltip = this.reservation = null;

        if (reservation?.valid) {
            const eventRecord = new scheduler.eventStore.modelClass(reservation);
            scheduler.editEvent(eventRecord, resource);
        }
    }
}
