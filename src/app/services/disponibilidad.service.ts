import { HttpClient } from "@angular/common/http";
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

        const params ={
            initialDate:initialDate.toISOString(),
            endDate:endDate.toISOString(),
            codigoCuarto:typeof habitacion === 'string' ? habitacion : habitacion.Codigo,
            numCuarto:typeof habitacion === 'string' ? habitacion : habitacion.Numero.toString(),
            cuarto:typeof habitacion === 'string' ? habitacion : '-1',
            dias:dias.toString(),
            folio:folio
        }


        return this.http.post<Disponibilidad[]>(environment.apiUrl + '/disponibilidad/reservas', {params})
        .pipe(
            map(responseData=>{
            //  this.writeIndexDB("Rates",responseData);
             return responseData
          })
          )
    }
}