import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Huesped } from "../models/huesped.model";
import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root',
  })
export class HuespedService {

    constructor(private http:HttpClient){

    }
    getAll() :Observable<Huesped[]> {

        return this.http
         .get<Huesped[]>(environment.apiUrl + '/huesped/getAll')
         .pipe(
           map(responseData=>{
           return responseData
         })
         )
    
       }
}
