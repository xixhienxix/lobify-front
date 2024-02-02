// Define a new store extending standard ResourceTimeRangeStore
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain resource time ranges.
// So we make a special model extending standard ResourceTimeRangeModel

import { DateHelper, ResourceTimeRangeModel, ResourceTimeRangeStore } from '@bryntum/scheduler';
import PropertyModel from './PropertyModel';

export class DailyRateModel extends ResourceTimeRangeModel {

    declare pricePerNight: number;

    static override fields = [
        { name : 'pricePerNight', type : 'number' }
    ];

}

export default class DailyRateStore extends ResourceTimeRangeStore {
    configure: any;

    constructor() {
        super();

        // Configure the store to use the DailyRateModel model
        if(typeof this.configure === 'function'){
            this.configure({
                modelClass : DailyRateModel
            });
        }
        
    }

    getPricePerNightFor(property: PropertyModel, date: Date) {
        const dayModel = this.getRanges({
            resourceRecord : property,
            startDate      : date,
            endDate        : DateHelper.add(date, 1, 'day')
        })?.[0];

        return (dayModel as DailyRateModel)?.pricePerNight;
    }
}
