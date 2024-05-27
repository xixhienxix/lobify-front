import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { environment } from "src/environments/environment";
import { Foliador } from "../_models/foliador.model";
import { LocalForageCache } from "src/app/tools/cache/indexdb-expire";


@Injectable({
    providedIn: 'root',
  })
export class FoliosService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Folios',
    defaultExpiration: 10800
});

private currentFolios$=new BehaviorSubject<Foliador[]>([]);

    constructor(private http:HttpClient){}

    get getcurrentFoliosValue(){
      return this.currentFolios$;
    }
  
    set setcurrentFoliosValue(folios: any) {
      this.currentFolios$.next(folios);
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

    getAll() :Observable<Foliador[]> {
        return this.http
         .get<Foliador[]>(environment.apiUrl + '/folios/all').pipe(
          map(responseData=>{
           const postArray = []
            for(const key in responseData)
            {
              if(responseData.hasOwnProperty(key))
              postArray.push(responseData[key]);
             }
             this.writeIndexDB("Folios",responseData);
             this.setcurrentFoliosValue = responseData 
   
             return responseData
        })
        )
       }
}
