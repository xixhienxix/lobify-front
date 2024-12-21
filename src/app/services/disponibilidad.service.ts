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

    async calcHabitacionesDisponibles(response:any,intialDate:Date,endDate:Date, cuarto:string){
        const ocupadasSet = new Set(response);

        const bloqueosArray = await this._indexDbCheck.loadBloqueos(true);

        // Normalize initialDate and endDate
        const normalizedInitialDate = this.normalizeDate(intialDate);
        const normalizedEndDate = this.normalizeDate(endDate);

        // Filter and add 'Cuarto' strings within the overlapping date range to the set
        bloqueosArray.forEach(bloqueo => {
          const { Desde, Hasta, Cuarto } = bloqueo;

          // Convert ISO strings to Date objects
          const desdeDate = new Date(Desde);
          const hastaDate = new Date(Hasta);

          // Normalize the dates to ignore time components
          const normalizedDesdeDate = this.normalizeDate(desdeDate);
          const normalizedHastaDate = this.normalizeDate(hastaDate);

          // Check for overlapping conditions
          const isOverlapping =
            // Case 1: The arrival date (Desde) is within the provided range
            (normalizedDesdeDate >= normalizedInitialDate && normalizedDesdeDate < normalizedEndDate) ||
            // Case 2: The departure date (Hasta) is within the provided range
            (normalizedHastaDate >= normalizedInitialDate && normalizedHastaDate <= normalizedEndDate) ||
            // Case 3: The reservation completely encompasses the provided range
            (normalizedDesdeDate < normalizedInitialDate && normalizedHastaDate > normalizedEndDate);

          // If there is an overlap, add Cuarto to the set
          if (isOverlapping && bloqueo.Completed === false) {
            Cuarto.forEach(cuarto => {
              ocupadasSet.add(cuarto);
            });
          }
        });
        const roomCodesComplete = await this._indexDbCheck.loadHabitaciones(true);
        // Filtrar las habitaciones disponibles
        const habitacionesDisponibles = roomCodesComplete.filter(habitacion => !ocupadasSet.has(habitacion.Numero));
        // Paso 1: Crear el array preAsignadasArray
        let preAsignadasArray

        preAsignadasArray = habitacionesDisponibles.map(item => ({
          numero: item.Numero,
          codigo: item.Codigo,
          checked: false,
          disabled: true
        }));

        // Paso 2: Filtrar para obtener solo un objeto único por cada 'Codigo'
        if(cuarto === '1'){
          const habitacionesUnicas:any = {};
          habitacionesDisponibles.forEach(habitacion => {
          if (!habitacionesUnicas[habitacion.Codigo]) {
            habitacionesUnicas[habitacion.Codigo] = habitacion;
          }
        });
        const habitacionesUnicasArray = Object.values(habitacionesUnicas);

        const responseObj = {
            avaibilityRooms : [...habitacionesUnicasArray],
            preAsignadasArray: preAsignadasArray
        }
        return responseObj
        

        }else{
            const responseObj = {
                avaibilityRooms : [...habitacionesDisponibles],
                preAsignadasArray: preAsignadasArray
            }
            return responseObj 
        }
    }

    /**
   *Converts Date Object to 00:00 so time its equaly asigned
   *
   * @param {Date} date
   * @return {*}  {Date}
   * @memberof NvaReservaComponent
   */
  normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}