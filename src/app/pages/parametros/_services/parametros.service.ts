import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, pipe, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Parametros } from '../_models/parametros';
import { DivisasService } from './divisas.service';
import { LocalForageCache } from 'src/app/tools/cache/indexdb-expire';
import { DateTime } from 'luxon';

export const timeZoneToLocaleMap: { [key: string]: string } = {
  'America/Adak': 'en-US', // Hawaii-Aleutian Time (DST)
  'America/Anchorage': 'en-US', // Alaska Standard Time (no DST)
  'America/Argentina/Buenos_Aires': 'es-AR', // Argentina (no DST)
  'America/Chicago': 'en-US', // Central Time (DST)
  'America/Denver': 'en-US', // Mountain Time (DST)
  'America/Guayaquil': 'es-EC', // Ecuador (no DST)
  'America/Houston': 'en-US', // Texas (DST)
  'America/Indianapolis': 'en-US', // Eastern Time (DST)
  'America/La_Paz': 'es-BO', // Bolivia (no DST)
  'America/Los_Angeles': 'en-US', // Pacific Time (DST)
  'America/Mexico_City': 'es-MX', // Mexico (DST)
  'America/New_York': 'en-US', // Eastern Time (DST)
  'America/Phoenix': 'en-US', // Arizona (no DST)
  'America/Porto_Acre': 'pt-BR', // Brazil (no DST)
  'America/Regina': 'en-CA', // Saskatchewan (no DST)
  'America/Sao_Paulo': 'pt-BR', // Brazil (DST)
  'America/Tijuana': 'es-MX', // Mexico (DST)
  'America/Toronto': 'en-CA', // Canada (DST)
  'America/Vancouver': 'en-CA', // British Columbia (DST)
  'America/Winnipeg': 'en-CA', // Manitoba (DST)
};

const DEFAULT_PARAMS ={
  _id:'',
  iva:16,
  ish:3,
  auditoria:'',
  noShow:'',
  checkOut:'',
  checkIn:'',
  zona:'',
  divisa:'',
  codigoZona:'',
  tarifasCancelacion:'',
  iddleTimer:5,
  inventario:10,
}

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Parametros',
    defaultExpiration: 10800
  });
  
  currentParametros$=new BehaviorSubject<Parametros>(DEFAULT_PARAMS);

  constructor(public http:HttpClient,
    private divisaService:DivisasService) { }

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


  get getCurrentParametrosValue(): Parametros {
    return this.currentParametros$.value;
  }

  set setCurrentParametrosValue(huesped: Parametros) {
    this.currentParametros$.next(huesped);
  }


  getParametros(){
    
    return this.http.get<Parametros>(environment.apiUrl+'/parametros').pipe(map(
      (value:any)=>{
        const postArray = []
         for(const key in value){
           if(value.hasOwnProperty(key))
           postArray.push(value[key]);
           this.setCurrentParametrosValue = postArray[0] 
           this.writeIndexDB("Parametros",postArray[0]);
          //  this.divisaService.getDivisasByParametro(postArray[0].divisa)   
          }
          return postArray[0]
      }))
  }

  postParametros(parametros: Parametros) {
    console.log(environment.apiUrl);
    return this.http
      .post(`${environment.apiUrl}/parametros/save`, { parametros })
      .pipe(
        map((item) => {
        }),
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        })
      );
  }

  // Function to convert date string to the correct timezone and optionally add 1 day
  convertToCorrectTimezone(dateString: string, addOneDay: boolean = false): Date {
    // Parse the input date string and convert it to a Luxon DateTime object in the provided zone
    const dateTime = DateTime.fromJSDate(new Date(dateString)).setZone('America/Mexico_City');//'America/Mexico_City'

    // If addOneDay is true, add 1 day to the DateTime
    const resultDateTime = addOneDay ? dateTime.plus({ days: 1 }) : dateTime;
    
    return resultDateTime.toJSDate(); // Convert Luxon DateTime to native JS Date
  }

}
