import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map } from 'rxjs';
import { Habitacion } from '../models/habitaciones.model';
import { environment } from 'src/environments/environment';
import { TableService } from '../_metronic/shared/services/table.service';
import { LocalForageCache } from '../tools/cache/indexdb-expire';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService extends TableService<Habitacion> implements OnDestroy {
    indexDBStorage = new LocalForageCache().createInstance({
      name: 'Lobify',
      storeName: 'RoomCodes',
      defaultExpiration: 10800
  });
  /*Oservables*/
  private currentHabitacion$=new BehaviorSubject<Habitacion[]>([]);
  private currentHabitacionSubject =new Subject<any>();

  private currentCodigosCaurto$=new BehaviorSubject<Habitacion[]>([]);
  private currentCodigosCuartoSubject =new Subject<any>();

  API_URL_MAIN = `${environment.apiUrl}`
  // currentCodigosCuartoSubject: BehaviorSubject<codigosCuarto>;


  constructor(@Inject(HttpClient) http: any,
   ) { 
    super(http);
    // this.currentCodigosCuartoSubject = new BehaviorSubject<codigosCuarto>(DEFAUL_CODIGOS);
  }

  async writeIndexDB(propertyName: string, propertyValue: any): Promise<void> {
    if (propertyName && propertyValue) {
        await this.indexDBStorage.setItem(propertyName, propertyValue);
    }
  }

  async readIndexDB(propertyName: string): Promise<any> {
      if (propertyName) {
          return  await this.indexDBStorage.getItem(propertyName);
      }
  }

  async deleteIndexDB(propertyName: string): Promise<void> {
      if (propertyName) {
          await this.indexDBStorage.removeItem(propertyName);
      }
  }

  
  get getcurrentHabitacionValue(){
    return this.currentHabitacion$;
  }

  set setcurrentHabitacionValue(habitacion: any) {
    this.currentHabitacion$.next(habitacion);
  }

  get getcurrentCodigosCuartoValue(){
    return this.currentCodigosCaurto$;
  }

  set setcurrentCodigosCuartoValue(habitacion: any) {
    this.currentCodigosCuartoSubject.next(habitacion);
  }

  async sendCustomFormNotification(_nuevoDatoAgregado:boolean){
    if(_nuevoDatoAgregado=true){
      this.currentHabitacionSubject.next(true)
    }
  };

  getcustomFormNotification() {
    return this.currentHabitacionSubject.asObservable();
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
          }
          this.writeIndexDB("Rooms",responseData);
          this.setcurrentHabitacionValue = responseData 

          return responseData
     })
     )
   }

   getCodigohabitaciones() :Observable<string[]>{
    return this.http
     .get<string[]>(environment.apiUrl + '/habitaciones/codigos')
     .pipe(
       map(responseData=>{
          return responseData
     })
     )
   }


   postHabitacion(habitacion:Habitacion,editar:boolean){
    const body = {
      habitacion,editar
    }

    return this.http.post(environment.apiUrl+'/habitacion/guardar',body).pipe(
      map(response=>{
        return response
      })
    )
   }

   searchRoom(habitacion:Habitacion){
    return this.http.post<Habitacion[]>(environment.apiUrl+'/habitacion/buscar',{habitacion})
  }

  deleteHabitacion(codigo:string){
    return this.http
    .delete(environment.apiUrl+'/habitacion/delete/'+codigo)
  }

  saveUrlToMongo(downloadURL:string,fileUploadName:string){

    return this.http.post(this.API_URL_MAIN+"/update/habitacion/imageurl",{downloadURL:downloadURL,fileUploadName:fileUploadName}).pipe(
      map(result => {
          return (result);  
       }),
      catchError((err) => {
        return err;
      })
    ).toPromise();
  }

   ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}

export const roomsTypeResolver: ResolveFn<Habitacion[]> = (
  _route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  return inject(HabitacionesService).getAll();
};
