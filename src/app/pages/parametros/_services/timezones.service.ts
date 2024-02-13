import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimezonesService {


  constructor(private http : HttpClient,) { }

  getTimeZones(){

   return this.http.get(environment.apiUrl+'/parametros/timezones')
  }
}
