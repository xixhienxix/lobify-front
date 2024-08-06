import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Parametros } from '../_models/parametros';
import { DivisasService } from './divisas.service';
import { LocalForageCache } from 'src/app/tools/cache/indexdb-expire';

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
  tarifasCancelacion:''
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

  postParametros(parametros:Parametros){

    return this.http.post(environment.apiUrl+'/parametros',{parametros}).pipe(map(item=>{
      return item
    }))
  }

}
