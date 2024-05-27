import { Injectable } from '@angular/core';
import { Huesped } from '../_models/huesped.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    constructor(private http: HttpClient) { 
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
}