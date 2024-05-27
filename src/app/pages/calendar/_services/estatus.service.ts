import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { environment } from "src/environments/environment";
import { Estatus } from "../_models/estatus.model";
import { LocalForageCache } from "src/app/tools/cache/indexdb-expire";


@Injectable({
    providedIn: 'root',
  })

export class EstatusService {
    indexDBStorage = new LocalForageCache().createInstance({
        name: 'Lobify',
        storeName: 'EstatusCodes',
        defaultExpiration: 10800
    });
    
    
    constructor(private http:HttpClient){

    }
    private currentEstatus$=new BehaviorSubject<Estatus[]>([]);


    get getcurrentEstatusValue(){
        return this.currentEstatus$;
      }
    
      set setcurrentEstatusValue(habitacion: any) {
        this.currentEstatus$.next(habitacion);
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

    getAll() :Observable<Estatus[]> {
        return this.http
         .get<Estatus[]>(environment.apiUrl + '/estatus/all')     
         .pipe(
            map(responseData=>{
             const postArray = []
              for(const key in responseData)
              {
                if(responseData.hasOwnProperty(key))
                postArray.push(responseData[key]);
               }
               this.writeIndexDB("EstatusCodes",responseData);
               this.setcurrentEstatusValue = responseData 
     
               return responseData
          })
          )
    }
}
