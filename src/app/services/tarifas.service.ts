import { HttpClient,  } from '@angular/common/http';
import {  Injectable,  } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Tarifas } from '../models/tarifas';
import { LocalForageCache } from '../tools/cache/indexdb-expire';





@Injectable({
  providedIn: 'root'
})
export class TarifasService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Rates',
    defaultExpiration: 10800
});

  API_URL = `${environment.apiUrl}/tarifario/Tarifas`;
  /*Oservables*/
  TarifasUpdate$: Observable<Tarifas[]>;
  private currentTarifas$=new BehaviorSubject<Tarifas[]>([]);
  private currentTarifasSubject =new Subject<any>();

  private subject =new Subject<any>();

  constructor(private http: HttpClient) {
    this.TarifasUpdate$=this.currentTarifas$.asObservable();
  }

  sendNotification(value:any)
  {
      this.subject.next({text:value});
  }

  getNotification(){
      return this.subject.asObservable();
  }

  get getCurrentTarifasValue() {
    return this.currentTarifas$;
  }

  set setCurrentTarifasValue(Tarifas: any) {
    this.currentTarifas$.next(Tarifas);
    this.sendCustomFormNotification(true);

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

  async sendCustomFormNotification(flag:boolean){
    await this.deleteIndexDB("Rates");
    this.getAll();
    this.currentTarifasSubject.next(flag)
  }

  getAll() :Observable<Tarifas[]> {
    return this.http
     .get<any[]>(environment.apiUrl + '/tarifario/tarifas')
     .pipe(
       map(responseData=>{
        // responseData.forEach((item)=>{
        //   if(item.hasOwnProperty('_id')){
        //     delete item._id;   
        //   }
        // })
        this.writeIndexDB("Rates",responseData);
        this.setCurrentTarifasValue = responseData 
        return responseData
     })
     )

   }

   getTarifaRack() :Observable<Tarifas[]> {
    return this.http
     .get<Tarifas[]>(environment.apiUrl + '/tarifario/tarifas/rack')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  postTarifa(tarifa:Tarifas){
    console.log("tarifaBAe Add New :", tarifa)
    return this.http.post(environment.apiUrl+'/tarifas/agregar',{tarifa}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ))
  }


  postTarifaEspecial(tarifa:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifas/especial/agregar',{tarifa}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ));
  }

  updateTarifas(tarifas:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifario/actualiza/tarifas',{tarifas}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ))
  }

  updateTarifasModifica(TarifasAnterior:any)
  {
    return this.http
    .post(environment.apiUrl+'/tarifario/actualiza/tarifas/modifica',{TarifasAnterior})
  }

  modificaTarifas(codigo:string, numero:string, llegada:string, salida:string)
  {
    return this.http
    .post(environment.apiUrl+'/tarifario/actualiza/tarifas',{codigo:codigo,numero:numero,llegada:llegada,salida:salida})
  }

  deleteTarifaEspecial(tarifa:Tarifas){
    return this.http.delete(environment.apiUrl+'/tarifas/especial/delete/'+tarifa._id,).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ));
  }

}
