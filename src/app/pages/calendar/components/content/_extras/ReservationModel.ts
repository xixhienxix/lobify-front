import { EventModel } from '@bryntum/scheduler';

// Custom event model, adding the guests and pricePerNight fields
export default class ReservationModel extends EventModel {

    declare guests: number;
    declare pricePerNight: number;

    static override get fields() : object[] {
        return [
            { name : 'guests', type : 'number', defaultValue : 2 },
            { name : 'pricePerNight', type : 'number' }
        ];
    }

}
