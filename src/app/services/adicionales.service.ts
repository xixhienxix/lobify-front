import { HttpClient, } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, map } from "rxjs";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";
import { Adicional } from "../models/adicional.model";


@Injectable({
    providedIn: 'root',
  })
export class AdicionalService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Adicionales',
    defaultExpiration: 10800
  });

private currentAdicional$=new BehaviorSubject<Adicional[]>([]);
private currentAdicionalSubject =new Subject<any>();

    constructor(private http:HttpClient){

    }

    get getcurrentAdicionalValue(){
      return this.currentAdicional$;
    }
  
    set setcurrentAdicionalValue(habitacion: any) {
      this.currentAdicional$.next(habitacion);
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
    //   this.getAdicionals();
      this.currentAdicionalSubject.next(flag)
    };


    getAdicionales(){
        
        return this.http.get<Adicional[]>(environment.apiUrl+'/adicionales/getall')
        .pipe(
            map((datosCuenta)=>{
            let Adicional:Adicional[]=[];
              for(let i=0;i<datosCuenta.length;i++){
                Adicional.push(datosCuenta[i])
              }
              return Adicional    
          }))
    }
}