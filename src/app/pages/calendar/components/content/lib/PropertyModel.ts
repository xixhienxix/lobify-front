import { ResourceModel } from '@bryntum/scheduler';

// Custom resource model, adding the sleeps field
export default class PropertyModel extends ResourceModel {

    declare sleeps : number;

    static override get fields(): object[] {
        return [
            { name : 'sleeps', type : 'number' }
        ];
    }

}
