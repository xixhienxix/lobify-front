import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Disponibilidad } from "../models/disponibilidad.model";
import { Habitacion } from "../models/habitaciones.model";
import { environment } from "src/environments/environment.prod";

@Injectable({
    providedIn:'root'
})
export class DisponibilidadService {
    constructor(private http: HttpClient){

    }

    getDisponibilidad(initialDate:Date, endDate:Date, habitacion: Habitacion | string, dias:number, folio:string) :Observable<Disponibilidad[]>{

            const params = new HttpParams()
            .set('initialDate', initialDate.toISOString())
            .set('endDate', endDate.toISOString())
            .set('codigoCuarto', typeof habitacion === 'string' ? habitacion : habitacion.Codigo)
            .set('numCuarto',typeof habitacion === 'string' ? habitacion : habitacion.Numero.toString())
            .set('cuarto', typeof habitacion === 'string' ? habitacion : '-1')
            .set('dias', dias.toString())
            .set('folio', folio)
        


        return this.http.get<Disponibilidad[]>(environment.apiUrl + '/reportes/disponibilidad', { params:params})
        .pipe(
            map(responseData=>{
            //  this.writeIndexDB("Rates",responseData);
             return responseData
          })
          )
    }
}