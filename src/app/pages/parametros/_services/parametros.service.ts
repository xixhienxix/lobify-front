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
  // North America
  'America/New_York': 'en-US',
  'America/Los_Angeles': 'en-US',
  'America/Chicago': 'en-US',
  'America/Denver': 'en-US',
  'America/Mexico_City': 'es-MX',
  'America/Toronto': 'en-CA',
  'America/Vancouver': 'en-CA',
  'America/Montreal': 'fr-CA',
  'America/Sao_Paulo': 'pt-BR',
  'America/Argentina/Buenos_Aires': 'es-AR',
  
  // Europe
  'Europe/London': 'en-GB',
  'Europe/Berlin': 'de-DE',
  'Europe/Paris': 'fr-FR',
  'Europe/Madrid': 'es-ES',
  'Europe/Rome': 'it-IT',
  'Europe/Moscow': 'ru-RU',
  'Europe/Amsterdam': 'nl-NL',
  'Europe/Lisbon': 'pt-PT',
  'Europe/Zurich': 'de-CH',
  'Europe/Brussels': 'fr-BE', // Could also be 'nl-BE' (Dutch) depending on region

  // Africa
  'Africa/Johannesburg': 'en-ZA',
  'Africa/Cairo': 'ar-EG',
  'Africa/Nairobi': 'en-KE',
  'Africa/Casablanca': 'fr-MA', // Could also be 'ar-MA'
  'Africa/Lagos': 'en-NG',

  // Asia
  'Asia/Tokyo': 'ja-JP',
  'Asia/Shanghai': 'zh-CN',
  'Asia/Hong_Kong': 'zh-HK',
  'Asia/Kolkata': 'hi-IN', // Hindi is dominant, but 'en-IN' is common for English
  'Asia/Singapore': 'en-SG',
  'Asia/Seoul': 'ko-KR',
  'Asia/Kuala_Lumpur': 'ms-MY',
  'Asia/Manila': 'en-PH',
  'Asia/Jakarta': 'id-ID',
  'Asia/Dubai': 'ar-AE',
  'Asia/Riyadh': 'ar-SA',

  // Oceania
  'Australia/Sydney': 'en-AU',
  'Australia/Melbourne': 'en-AU',
  'Pacific/Auckland': 'en-NZ',
  'Pacific/Honolulu': 'en-US',

  // Middle East
  'Asia/Jerusalem': 'he-IL',
  'Asia/Tehran': 'fa-IR',
  'Asia/Istanbul': 'tr-TR',

  // Miscellaneous
  'Atlantic/Reykjavik': 'is-IS',
  'Europe/Kiev': 'uk-UA',
  'Pacific/Fiji': 'en-FJ'
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
