import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Huesped } from "../models/huesped.model";
import { environment } from "src/environments/environment";
import { Codigos } from "../models/codigos.model";


@Injectable({
    providedIn: 'root',
  })
export class CodigosService {

    constructor(private http:HttpClient){

    }
    getAll() :Observable<Codigos[]> {
        return this.http
         .get<Codigos[]>(environment.apiUrl + '/codigos/getAll')
       }
}
