import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { Huesped } from "../models/huesped.model";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";


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

    constructor(private http:HttpClient){

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

    updateEstatusHuesped(huesped:Huesped){
      return this.http.post(environment.apiUrl+'/actualiza/estatus/huesped',{huesped})
    }
}
