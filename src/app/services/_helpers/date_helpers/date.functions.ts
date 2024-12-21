import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { ParametrosService } from "src/app/pages/parametros/_services/parametros.service";

@Injectable({
    providedIn:'root'
})
export class DateHelpers {
    constructor(private _parametrosService:ParametrosService){}

    /**
     * Compares if two date values are on the same Date (Date only)
     *
     * @param {string} isoDate
     * @param {string} JsDate
     * @return {*}  {boolean}
     * @memberof DateHelpers
     */
    compareIsoDateWithJsDate(isoDate:string, JsDate:string):boolean{

        // Parse the ISO string with Luxon and set zone
        const luxonDate = DateTime.fromISO(isoDate).setZone(this._parametrosService.getCurrentParametrosValue.codigoZona);

        // Parse the JavaScript date string into Luxon DateTime and set zone
        const jsDate = DateTime.fromJSDate(new Date(JsDate)).setZone(this._parametrosService.getCurrentParametrosValue.codigoZona);

        // Extract the date components (ignoring time)
        const luxonDateOnly = luxonDate.toISODate(); // e.g., "2024-10-22"
        const jsDateOnly = jsDate.toISODate();       // e.g., "2024-12-20"

        // Compare the dates
        if (luxonDateOnly === jsDateOnly) {
            return true
        } else {
            return false
        }
    }
}