import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { Huesped } from "../models/huesped.model";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";
const EMPTY_CUSTOMER: Huesped = {
  folio:'',
  adultos:1,
  ninos:1,
  nombre: '',
  estatus:'',
  // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:'',
  porPagar: 500,
  pendiente:500,
  origen: 'Online',
  habitacion: "",
  telefono:"",
  email:"",
  motivo:"",
  //OTROS DATOs
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'Español',
  numeroCuarto:'0',
  creada: new Date().toString(),
  tipoHuesped:"Regular"
};

@Injectable({
    providedIn: 'root',
  })
export class HuespedService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Reservations',
    defaultExpiration: 10800
  });

  updateReservations$ = new BehaviorSubject<boolean>(false)
  updatedReservations$ = new BehaviorSubject<Huesped[]>([])
  
  huespedUpdate$: Observable<Huesped>;
  private currentHuesped$=new BehaviorSubject<Huesped>(EMPTY_CUSTOMER);


  get getCurrentHuespedValue(): Huesped {
    return this.currentHuesped$.value;
  }

  set setCurrentHuespedValue(huesped: Huesped) {
    this.currentHuesped$.next(huesped);
  }

    constructor(private http:HttpClient){
      this.huespedUpdate$=this.currentHuesped$.asObservable();
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

    getAll(newReservarion:boolean=false) :Observable<Huesped[]> {
        return this.http
         .get<Huesped[]>(environment.apiUrl + '/huesped/getAll')
         .pipe(
           map(responseData=>{
            this.writeIndexDB("Reservations",responseData);
            this.updatedReservations$.next(responseData);
            if(newReservarion){
              this.updateReservations$.next(true);
            }
           return responseData
         })
         )
    
       }

       addPost(huespedInfo:Huesped[]) {
        return this.http.post<any>(environment.apiUrl+"/huesped/save", {huespedInfo})
        .pipe(
            map(responseData=>{
             const postArray = []
              for(const key in responseData)
              {
                if(responseData.hasOwnProperty(key))
                postArray.push(responseData[key]);
               }
     
               return responseData
          })
          )
    }
  
    updateReserva(data:any){
      return this.http.post<any>(environment.apiUrl+"/reserva/onreservaresize", {data})
      .pipe(
        map(responseData=>{
         const postArray = []
          for(const key in responseData)
          {
            if(responseData.hasOwnProperty(key))
            postArray.push(responseData[key]);
           }
  
           return responseData
      })
      )
    }

    updateEstatusHuesped(huesped:Huesped,){
      return this.http.post(environment.apiUrl+'/actualiza/estatus/huesped',{huesped})
    }

    updateHuesped(huesped:Huesped){
      return this.http.post(environment.apiUrl+'/reportes/actualiza/huesped',{huesped})
    }
}
