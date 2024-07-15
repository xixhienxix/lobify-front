import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Tarifas } from '../models/tarifas';
import { LocalForageCache } from '../tools/cache/indexdb-expire';

const DEFAULT_TARIFA = {
  Tarifa:'',
  Habitacion:[],
  Llegada:new Date(),
  Salida:new Date(),
  Plan:'',
  Politicas:'',
  EstanciaMinima:1,
  EstanciaMaxima:1,
  Estado:true,
  TarifaRack:0,
  TarifaXAdulto:[0],
  TarifaXNino:[0],
  Descuento:0,
  Adultos:1,
  Ninos:0,
  Dias:[
    {name:'Lun', value:0, checked:false},
    {name:'Mar', value:1, checked:false},
    {name:'Mie', value:2, checked:false},
    {name:'Jue', value:3, checked:false},
    {name:'Vie', value:4, checked:false},
    {name:'Sab', value:5, checked:false},
    {name:'Dom', value:6, checked:false}
  ]
}



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
  private ngUnsubscribe = new Subject<void>();
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
    const deleted = await this.deleteIndexDB("Rates");
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
      map((data=>{
        this.sendNotification(true);
        }
    )))
  }


  postTarifaEspecial(tarifa:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifas/especial/agregar',{tarifa}).pipe(
      map((data=>{
        this.sendNotification(true);
        }
    )));
  }

  updateTarifas(tarifas:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifario/actualiza/tarifas',{tarifas}).pipe(
      map((data=>{
        this.sendNotification(true);
        }
    )))
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
      map((data=>{
        this.sendNotification(true);
        }
    )));
  }

}
