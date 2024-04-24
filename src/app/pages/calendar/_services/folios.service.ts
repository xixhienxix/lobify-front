import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "src/environments/environment";
import { Foliador } from "../_models/foliador.model";


@Injectable({
    providedIn: 'root',
  })
export class FoliosService {

    constructor(private http:HttpClient){

    }
    getAll() :Observable<Foliador[]> {
        return this.http
         .get<Foliador[]>(environment.apiUrl + '/codigos/getAll')
       }
}
