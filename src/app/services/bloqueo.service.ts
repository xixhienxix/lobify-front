import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Bloqueo } from '../_metronic/layout/components/header/bloqueos/_models/bloqueo.model';
import { ParametrosService } from '../pages/parametros/_services/parametros.service';



@Injectable({
  providedIn: 'root'
})
export class BloqueoService  {
    constructor(private http: HttpClient, private _parametrosService:ParametrosService) { }


  getBloqueosbyTipo(id:string) : Observable<Bloqueo[]> {
  return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/reportes/bloqueos/"+id)
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }

  getBloqueosbyId(id:string) : Observable<Bloqueo[]> {
    return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/get/bloqueos/"+id)
        .pipe(
          map(responseData=>{

            console.log("MAP",responseData)
            return responseData
          })
        ))
    }

  actualizaBloqueos(
    _id:string,
    desde:string,
    hasta:string,
    cuarto:Array<string>,
    numCuarto:Array<number>,
    sinLlegadasChecked:boolean,
    sinSalidasChecked:boolean,
    fueraDeServicio:boolean,
    comentarios:string
    ) {


      let bloqueos: Bloqueo = {
                                _id:_id,
                                Habitacion:cuarto,
                                Cuarto:numCuarto,
                                Desde:desde,
                                Hasta:hasta,
                                sinLlegadas:sinLlegadasChecked,
                                sinSalidas:sinSalidasChecked,
                                fueraDeServicio:fueraDeServicio,
                                Comentarios:comentarios.trim(),
                                };

   return this.http.post<Bloqueo>(environment.apiUrl+"/actualiza/bloqueos", {bloqueos},{observe:'response'})

      }


  deleteBloqueo(id:any) {
   return this.http.delete(environment.apiUrl + "/reportes/borrar-bloqueo/"+id,{observe:'response'})

  }


  getBloqueos() :Observable<Bloqueo[]> {
   return this.http
    .get<Bloqueo[]>(environment.apiUrl + '/reportes/bloqueos')
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }
  postBloqueo(
    _id:string,
    desde:string,
    hasta:string,
    cuarto:Array<string>,
    numCuarto:Array<number>,
    sinLlegadasChecked:boolean,
    sinSalidasChecked:boolean,
    fueraDeServicio:boolean,
    text:string
    ) {

const bloqueos: Bloqueo = {
_id:_id,
Habitacion:cuarto,
Cuarto:numCuarto,
Desde:desde,
Hasta:hasta,
sinLlegadas:sinLlegadasChecked,
sinSalidas:sinSalidasChecked,
fueraDeServicio:fueraDeServicio,
Comentarios:text,
};

 return this.http.post<any>(environment.apiUrl+"/reportes/bloqueos/post", {bloqueos}, {observe:'response'})

  }

  liberaBloqueos(
    _id:string,
    desde:string,
    hasta:string,
    habitacion:Array<string>,
    numCuarto:Array<number>,
    ) {

      let bloqueos: Bloqueo = {
                                _id:_id,
                                Habitacion:habitacion,
                                Cuarto:numCuarto,
                                Desde:desde,
                                Hasta:hasta,
                                sinLlegadas:false,
                                sinSalidas:false,
                                fueraDeServicio:false,
                                Comentarios:'',
                                };

  return this.http.post<Bloqueo>(environment.apiUrl+"/libera/bloqueos", {bloqueos})

      }

}
