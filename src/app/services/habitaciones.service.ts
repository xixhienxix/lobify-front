import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { Habitacion } from '../models/habitaciones.model';
import { environment } from 'src/environments/environment';
import { ITableState } from '../_metronic/shared/models/table.model';
import { TableService } from '../_metronic/shared/services/table.service';
import { codigosCuarto } from '../models/codigosCuarto.model';
const DEFAULT_HABITACION = {
  _id:'',
  Codigo:'',
  Numero:[],
  Tipo:'',
  Descripcion:'',
  Camas:1,
  Adultos:1,
  Ninos:1,
  Inventario:1,
  Vista:'',
  Amenidades:[],
  Tipos_Camas:[],
  Orden:1,
  Tarifa:0
}
const DEFAUL_CODIGOS = {
  nombreHabitacion:'',
  codigo:'',
  tipo:'',
  capacidad:''
}
@Injectable({
  providedIn: 'root'
})
export class HabitacionesService extends TableService<Habitacion> implements OnDestroy {

  /*Oservables*/
  HabitacionUpdate$: Observable<Habitacion>;
  private currentHabitacion$=new BehaviorSubject<Habitacion>(DEFAULT_HABITACION);
  API_URL_MAIN = `${environment.apiUrl}`
  currentCodigosCuartoSubject: BehaviorSubject<codigosCuarto>;


  constructor(@Inject(HttpClient) http: any,   
   ) { 
    super(http);
    this.HabitacionUpdate$=this.currentHabitacion$.asObservable();
    this.currentCodigosCuartoSubject = new BehaviorSubject<codigosCuarto>(DEFAUL_CODIGOS);

  }

  get getcurrentHabitacionValue(): Habitacion {
    return this.currentHabitacion$.value;
  }

  set setcurrentHabitacionValue(Habitacion: Habitacion) {
    this.currentHabitacion$.next(Habitacion);
  }

  get getcurrentUserValue(): codigosCuarto {
    return this.currentCodigosCuartoSubject.value;
  }

  set setcurrentUserValue(user: codigosCuarto) {
    this.currentCodigosCuartoSubject.next(user);
  }

   getAll() :Observable<Habitacion[]> {
    return this.http
     .get<Habitacion[]>(environment.apiUrl + '/habitaciones')
     .pipe(
       map(responseData=>{
        const postArray = []
         for(const key in responseData)
         {
           if(responseData.hasOwnProperty(key))
           postArray.push(responseData[key]);
           this.setcurrentHabitacionValue = postArray[0] 
          }
          return responseData
     })
     )
   }

   postHabitacion(habitacion:Habitacion,editar:boolean,filename:File){

    return this.http.post(environment.apiUrl+'/habitacion/guardar',{habitacion,editar}).pipe(
      map(response=>{
        return response
      })
    )
   }

   searchRoom(habitacion:Habitacion){
    return this.http.post<Habitacion[]>(environment.apiUrl+'/habitacion/buscar',{habitacion})
  }

  deleteHabitacion(_id:string){
    return this.http
    .delete(environment.apiUrl+'/habitacion/delete/'+_id)
  }

  saveUrlToMongo(downloadURL:string,fileUploadName:string){

    return this.http.post(this.API_URL_MAIN+"/update/habitacion/imageurl",{downloadURL:downloadURL,fileUploadName:fileUploadName}).pipe(
      map(result => {
          return (result);  
       }),
      catchError((err, caught) => {
        return err;
      })
    ).toPromise();
  }

   ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
