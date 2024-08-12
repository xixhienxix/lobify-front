// log.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivityLogs, DEFAULT_LOG } from '../models/activity-log.model';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
    constructor(private http: HttpClient){}

    private userLogs$=new BehaviorSubject<ActivityLogs[]>([]);

//   private logs: Array<ActivityLogs> = [];

  get getuserLogs(){
    return this.userLogs$;
  }

  set setuserLogs(data: any) {
    this.userLogs$.next(data);
  }
  // Implement the method to send logs to the server
  sendLogToServer(logEntry: ActivityLogs) {
    this.http.post(environment.apiUrl+'/activity/sendlogs',{logEntry})
      .subscribe(response => {
        this.setuserLogs.next(logEntry);
      }
    );
  }

  getLogs(username:string) :Observable<ActivityLogs[]> {
    return this.http
      .get<ActivityLogs[]>(`${environment.apiUrl}/activity/log`)
      .pipe(
        map((responseData) => {
          console.log('Response Data:', responseData); // Debug statement
          if (responseData) {
            this.userLogs$.next(responseData);
          } else {
            this.userLogs$.next([]);
          }
          return responseData || [];
        }),
        catchError((error) => {
          console.error('Error fetching logs:', error);
          return of([]); // Return an empty array in case of error
        })
      );
  }
  //LOGS
  logNvaReserva(message: string,username:string, folio:string) {
    const date = new Date();
    const formattedDate = this.formatDate(date)
    const logEntry = {
      timestamp: formattedDate,
      message,
      username,
      folio
    };
    this.sendLogToServer(logEntry);

  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${day} ${month} ${hours}:${minutes}`;
  }

  // Optional: Method to send log to the server
  // private sendLogToServer(logEntry: { timestamp: Date; message: string }) {
  //   // Implement the logic to send logs to the server
  // }
}