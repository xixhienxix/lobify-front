import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Disponibilidad } from "../models/disponibilidad.model";
import { Habitacion } from "../models/habitaciones.model";
import { environment } from "src/environments/environment.prod";
import { IndexDBCheckingService } from "./_shared/indexdb.checking.service";
import { timeZoneToLocaleMap } from "../pages/parametros/_services/parametros.service";
import { DateTime } from 'luxon';

@Injectable({
    providedIn:'root'
})
export class DisponibilidadService {
    constructor(
        private http: HttpClient,
        private _indexDbCheck: IndexDBCheckingService
    ){
    }

    getDisponibilidad(initialDate:Date, endDate:Date, habitacion: Habitacion | string, dias:number, folio:string) :Observable<any>{

        // this._indexDbCheck.checkIndexedDB(['parametros'],true);
        // const timeZone: string = this._indexDbCheck.getParametrosModel().zona;

        // Use 'as keyof typeof' to cast the key properly
        // const locale = timeZoneToLocaleMap[timeZone as keyof typeof timeZoneToLocaleMap] || 'en-US';
        // Create the current date-time with the specified time zone
        const initialDateLuxon = DateTime.fromJSDate(initialDate, { zone: 'America/Mexico_City' }).setLocale('es-MX');
        const endDateLuxon = DateTime.fromJSDate(endDate, { zone: 'America/Mexico_City' }).setLocale('es-MX');

        // Get ISO string
        const initialDateLuxonISOString = initialDateLuxon.toISO();
        const endDateLuxonISOString = endDateLuxon.toISO();
        
        // const formattedInitialDate = initialDate.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
        // const formattedEndDate = endDate.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

        const params ={
            initialDate:initialDateLuxonISOString,
            endDate:endDateLuxonISOString,
            codigoCuarto:typeof habitacion === 'string' ? habitacion : habitacion.Codigo,
            numCuarto:typeof habitacion === 'string' ? habitacion : habitacion.Numero.toString(),
            cuarto:typeof habitacion === 'string' ? habitacion : '-1',
            dias:dias.toString(),
            folio:folio
        }

        return this.http.post<any>(environment.apiUrl + '/disponibilidad/reservas', {params})
        .pipe(
            map(responseData=>{
            //  this.writeIndexDB("Rates",responseData);
             return responseData
          })
          )
    }
}