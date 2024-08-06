import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";
import { HouseKeeping } from "../pages/calendar/_models/housekeeping.model";


@Injectable({
    providedIn: 'root',
  })
export class HouseKeepingService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'HouseKeepingCodes',
    defaultExpiration: 10800
  });

private currentHouseKeeping$=new BehaviorSubject<HouseKeeping[]>([]);
private currentHouseKeepingSubject =new Subject<any>();

    constructor(private http:HttpClient){

    }

    get getcurrentHouseKeepingValue(){
      return this.currentHouseKeeping$;
    }
  
    set setcurrentHouseKeepingValue(habitacion: any) {
      this.currentHouseKeeping$.next(habitacion);
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
      this.getAll();
      this.currentHouseKeepingSubject.next(flag)
    };


    getAll() :Observable<HouseKeeping[]> {
        return this.http
         .get<HouseKeeping[]>(environment.apiUrl + '/codigos/housekeeping')
         .pipe(
          map(responseData=>{
           const postArray = []
            for(const key in responseData)
            {
              if(responseData.hasOwnProperty(key))
              postArray.push(responseData[key]);
             }
             this.writeIndexDB("HouseKeeping",responseData);
             this.setcurrentHouseKeepingValue = responseData 
   
             return responseData
        })
        )
  }

  updateEstatus(cuarto:string,estatus:string){
    return this.http.post<HouseKeeping[]>(environment.apiUrl + '/codigos/update/housekeeping',{cuarto,estatus});
  }
}