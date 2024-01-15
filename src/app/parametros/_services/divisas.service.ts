import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Divisas } from '../_models/divisas';
const DEFAULT_DIVISA ={
  _id:'',
    Localidad:'Mexico',
    Nombre:'Peso',
    Simbolo:'$'
}
@Injectable({
  providedIn: 'root'
})
export class DivisasService {

private currentDivisa$ = new BehaviorSubject<Divisas>(DEFAULT_DIVISA)

get getcurrentDivisa():Divisas{
return this.currentDivisa$.value
}

set setcurrentDivisa(divisa:Divisas){
  this.currentDivisa$.next(divisa)
}

  constructor(
    public http:HttpClient,
  ) { }

  getDivisas(){
    const hotel = sessionStorage.getItem("HOTEL") as string;
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.get(environment.apiUrl+'/parametros/divisas',{params:queryParams})
  }

  getDivisasByParametro(divisa:string, hotel:string){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

     this.http.get<Divisas>(environment.apiUrl+'/parametros/divisas/'+divisa,{params:queryParams})
    .subscribe(
      (value:any)=>{
        this.setcurrentDivisa=value[0]
      },
      )
  }
}
