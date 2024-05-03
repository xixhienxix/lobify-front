import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { Huesped } from "../models/huesped.model";
import { environment } from "src/environments/environment";
import { Codigos } from "../models/codigos.model";
import { LocalForageCache } from "../tools/cache/indexdb-expire";


@Injectable({
    providedIn: 'root',
  })
export class CodigosService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Codes',
    defaultExpiration: 10800
  });

private currentCodigos$=new BehaviorSubject<Codigos[]>([]);
private currentCodigosSubject =new Subject<any>();

    constructor(private http:HttpClient){

    }

    get getcurrentCodigosValue(){
      return this.currentCodigos$;
    }
  
    set setcurrentCodigosValue(habitacion: any) {
      this.currentCodigos$.next(habitacion);
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
      const deleted = await this.deleteIndexDB("Codes");
      this.getAll();
      this.currentCodigosSubject.next(flag)
    };


    getAll() :Observable<Codigos[]> {
        return this.http
         .get<Codigos[]>(environment.apiUrl + '/codigos/getAll')
         .pipe(
          map(responseData=>{
           const postArray = []
            for(const key in responseData)
            {
              if(responseData.hasOwnProperty(key))
              postArray.push(responseData[key]);
             }
             this.writeIndexDB("Codes",responseData);
             this.setcurrentCodigosValue = responseData 
   
             return responseData
        })
        )
       }
}
