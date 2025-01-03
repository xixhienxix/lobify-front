import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, catchError, firstValueFrom, forkJoin, map, of } from "rxjs";
import { Huesped } from "../models/huesped.model";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";
import { Edo_Cuenta_Service } from "./edoCuenta.service";
import { LogService } from "./activity-logs.service";
import { DEFAULT_TARIFAS } from "../models/tarifas";
export const EMPTY_CUSTOMER: Huesped = {
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
  tarifa:DEFAULT_TARIFAS,
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
  currentHuesped$=new BehaviorSubject<Huesped>(EMPTY_CUSTOMER);


  get getCurrentHuespedValue(): Huesped {
    return this.currentHuesped$.value;
  }

  set setCurrentHuespedValue(huesped: Huesped) {
    this.currentHuesped$.next(huesped);
  }

    constructor(
      private http:HttpClient,
      private _estadoDeCuenta: Edo_Cuenta_Service,
      private _logService: LogService
    ){
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

    async getUsernameFromLocalStorage():Promise<string> {
      return new Promise((resolve, reject) => {
        try {
          // Retrieve the USER item from localStorage
          const user = localStorage.getItem('USER');
    
          if (user) {
            // Parse the JSON string into an object
            const userObject = JSON.parse(user);
    
            // Resolve with the username property
            resolve(userObject.username);
          } else {
            // Reject if USER is not found
            reject('USER not found in localStorage.');
          }
        } catch (error:any) {
          // Reject with any parsing or other errors
          reject('Error parsing USER from localStorage: ' + error.message);
        }
      });
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
              for(const key in responseData){
                if(responseData.hasOwnProperty(key))
                postArray.push(responseData[key]);
               }
               this.updateReservations$.next(true);
               return responseData
          })
          )
    }
  
    updateReservaResize(data:any){
      return this.http.post<any>(environment.apiUrl+"/reserva/onreservaresize", {data})
      .pipe(
        map(responseData=>{
         const postArray = []
          for(const key in responseData)
          {
            if(responseData.hasOwnProperty(key))
            postArray.push(responseData[key]);
           }
           this.updateReservations$.next(true);
           return responseData
      })
      )
    }

    updateReserva(data:Huesped[]){
      return this.http.post<any>(environment.apiUrl+"/reserva/modifica/huesped", {data})
      .pipe(
        map(responseData=>{
         const postArray = []
          for(const key in responseData)
          {
            if(responseData.hasOwnProperty(key))
            postArray.push(responseData[key]);
           }
           this.updateReservations$.next(true);
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


    // MAIN PROCESS

    async processNuevaReserva(huespedArray: Huesped[]): Promise<any> {
      const pago = huespedArray.map(item => ({
        Folio: item.folio,
        Forma_de_Pago: '',
        Fecha: new Date(),
        Descripcion: 'HOSPEDAJE',
        Cantidad: 1,
        Cargo: item.pendiente,
        Abono: 0,
        Total: item.pendiente,
        Estatus: 'Activo',
      }));
    
      // Log the beginning of the process
      console.log('Starting nueva reserva process for huespedes:', huespedArray);
    
      // Create requests for huesped and estadoDeCuenta
      const request1 = this.addPost(huespedArray).pipe(
        catchError(error => {
          console.error('Error with adding huespedes:', error);
          return of(null); // Continue the process even if one request fails
        })
      );
    
      const request2 = this._estadoDeCuenta.agregarHospedaje(pago).pipe(
        catchError(error => {
          console.error('Error with adding estadoDeCuenta:', error);
          return of(null); // Continue the process even if one request fails
        })
      );
    
      // Log the status of requests
      console.log('Sending requests to backend...');
      
      // Handle both requests with forkJoin
      const [huespedResponse, estadoDeCuentaResponse] = await firstValueFrom(forkJoin([request1, request2]));
    
      // Log the results of both requests
      if (huespedResponse) {
        console.log('Huespedes added successfully:', huespedResponse);
      } else {
        console.log('Failed to add huespedes');
      }
    
      if (estadoDeCuentaResponse) {
        console.log('Estado de cuenta updated successfully:', estadoDeCuentaResponse);
      } else {
        console.log('Failed to update estado de cuenta');
      }
      const username = await this.getUsernameFromLocalStorage();

      // Log each reservation being created
      const logRequests = huespedResponse?.addedDocuments?.map((item: any) =>
        this._logService.logNvaReserva('Created Nueva Reserva', username, item.folio).pipe(
          catchError(error => {
            console.error(`Failed to log reservation for folio: ${item.folio}`, error);
            return of(null); // Continue the process even if logging fails
          })
        )
      ) || [];
    
      if (logRequests.length > 0) {
        console.log('Logging created nueva reserva...');
        await firstValueFrom(forkJoin(logRequests));
        console.log('Logging complete.');
      }
    
      // Fetch updated huespedes and return them
      console.log('Fetching updated list of huespedes...');
      const allHuespedes = await this.getAll(true);
      console.log('Fetched all huespedes:', allHuespedes);
    
      return allHuespedes;
    }
    
    
}
