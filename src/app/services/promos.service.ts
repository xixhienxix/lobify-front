import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Promos } from "../models/promos";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";
import { BehaviorSubject, map, Subject } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class PromosService {
      indexDBStorage = new LocalForageCache().createInstance({
        name: 'Lobify',
        storeName: 'Promos',
        defaultExpiration: 10800
    });

    private subject =new Subject<any>();
    private currentPromos$=new BehaviorSubject<Promos[]>([]);
    private currentPromosSubject =new Subject<any>();

    constructor (private http: HttpClient){

    }

    sendPromosNotification(value:any){
        this.subject.next({text:value});
    }
  
    getPromosNotification(){
        return this.subject.asObservable();
    }
  
    get getCurrentTarifasValue() {
      return this.currentPromos$;
    }
  
    set setCurrentTarifasValue(promos: any) {
      this.currentPromos$.next(promos);
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
        await this.deleteIndexDB("Promos");
        this.getAll();
        this.currentPromosSubject.next(flag)
      }

    getAll(){
        return this.http.get<Promos>(environment.apiUrl + '/promos')
        .pipe(
            map(responseData=>{
                this.writeIndexDB("Promos",responseData);
                this.setCurrentTarifasValue = responseData 
                return responseData
            })
            )
    }
}