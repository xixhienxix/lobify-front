import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { environment } from "src/environments/environment";
import { LocalForageCache } from "../tools/cache/indexdb-expire";
import { Promesa } from "../pages/calendar/_models/promesas.model";


@Injectable({
    providedIn: 'root',
  })
export class PromesaService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Promesas',
    defaultExpiration: 10800
  });

private currentPromesa$=new BehaviorSubject<Promesa[]>([]);
private currentPromesaSubject =new Subject<any>();

    constructor(private http:HttpClient){

    }

    get getcurrentPromesaValue(){
      return this.currentPromesa$;
    }
  
    set setcurrentPromesaValue(habitacion: any) {
      this.currentPromesa$.next(habitacion);
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
      const deleted = await this.deleteIndexDB("Promesas");
    //   this.getPromesas();
      this.currentPromesaSubject.next(flag)
    };


    getPromesas(folio:string){
        
        return this.http.get<Promesa[]>(environment.apiUrl+'/promesas/'+folio)
        .pipe(
            map((datosCuenta)=>{
            let promesa:Promesa[]=[];
              for(let i=0;i<datosCuenta.length;i++){
                promesa.push(datosCuenta[i])
              }
              return promesa    
          }))
    }

    updatePromesaEstatus(id:string, estatus:string){
        return this.http.put(environment.apiUrl+"/promesas/update/estatus",{id,estatus})
    }

    guardarPromesa(folio:number,fecha:Date,cantidad:number,estatus:string){
        return this.http.post(environment.apiUrl+'/reportes/promesa',{folio:folio,fecha:fecha,cantidad:cantidad,estatus:estatus})
    }
}