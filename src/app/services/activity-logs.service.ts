// log.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivityLogs, DEFAULT_LOG, PropertiesChanged } from '../models/activity-log.model';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Huesped } from '../models/huesped.model';
import { Bloqueo } from '../_metronic/layout/components/header/bloqueos/_models/bloqueo.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
    constructor(private http: HttpClient){}

    userLogs$=new BehaviorSubject<ActivityLogs[]>([]);

//   private logs: Array<ActivityLogs> = [];

  get getuserLogs(){
    return this.userLogs$;
  }

  set setuserLogs(data: any) {
    this.userLogs$.next(data);
  }
  // Implement the method to send logs to the server
  sendLogToServer(logEntry: ActivityLogs): Observable<any> {
    return this.http.post(environment.apiUrl + '/activity/sendlogs', { logEntry });
  }

  getLogs(username: string): Observable<ActivityLogs[]> {
    return this.http
      .get<ActivityLogs[]>(`${environment.apiUrl}/activity/log/${username}`)
      .pipe(
        map((responseData) => {
          console.log('Response Data:', responseData); // Debug statement
          if (responseData) {
            responseData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            this.userLogs$.next(responseData);
          } else {
            this.userLogs$.next([]);
          }
          return responseData || [];
        }),
        catchError((error) => {
          console.error('Error fetching logs:', error);
          this.userLogs$.next([]); // Clear the logs in case of error
          return of([]); // Return an empty array in case of error
        })
      );
  }
  //LOGS
  logNvaReserva(message: string, username: string, folio: string): Observable<any> {
    const date = new Date();
    const formattedDate = this.formatDate(date);
    const logEntry = {
      timestamp: formattedDate.toISOString(),
      message,
      username,
      folio,
      logType:1
    };
    return this.sendLogToServer(logEntry).pipe(
      tap(() => {
        // Update userLogs BehaviorSubject after posting the log
        const updatedLogs = [...this.userLogs$.value, logEntry];
        this.userLogs$.next(updatedLogs);
      })
    );
  }

  logNvoBloqueo(message: string, username: string, bloqueo:Bloqueo){
    const date = new Date();
    const formattedDate = this.formatDate(date);
    const logEntry = {
      timestamp: formattedDate.toISOString(),
      message,
      username,
      bloqueo,
      logType:4
    };
    return this.sendLogToServer(logEntry).pipe(
      tap(() => {
        // Update userLogs BehaviorSubject after posting the log
        const updatedLogs = [...this.userLogs$.value, logEntry];
        this.userLogs$.next(updatedLogs);
      })
    );
  }

  logChangeStatus(cuarto:string,status:string, oldStatus:string, username:string){
    const date = new Date();
    const logEntry = {
        timestamp: date.toISOString(),
        message:'Updated Status',
        username:username,
        oldStatus:oldStatus,
        newStatus:status,
        logType:2
      };
      return this.sendLogToServer(logEntry).pipe(
        tap(() => {
          // Update userLogs BehaviorSubject after posting the log
          const updatedLogs = [...this.userLogs$.value, logEntry];
          this.userLogs$.next(updatedLogs);
        })
      );
  }

  logChangeStatusHuesped(cuarto:string,status:string, oldStatus:string, username:string){
    const date = new Date();
    const logEntry = {
        timestamp: date.toISOString(),
        message:'Updated Status',
        username:username,
        oldStatus:oldStatus,
        newStatus:status,
        logType:2
      };
      return this.sendLogToServer(logEntry).pipe(
        tap(() => {
          // Update userLogs BehaviorSubject after posting the log
          const updatedLogs = [...this.userLogs$.value, logEntry];
          this.userLogs$.next(updatedLogs);
        })
      );
  }

  logUpdateReserva(message: string, username: string, folio: string, propertiesChanged:any): Observable<any> {
    const date = new Date();
    const formattedDate = this.formatDate(date);
    const logEntry = {
      timestamp: formattedDate.toISOString(),
      propertiesChanged,
      message,
      username,
      folio,
      logType:3
    };
    return this.sendLogToServer(logEntry).pipe(
      tap(() => {
        // Update userLogs BehaviorSubject after posting the log
        const updatedLogs = [...this.userLogs$.value, logEntry];
        this.userLogs$.next(updatedLogs);
      })
    );
  }

  logChangedProperties(message: string, username: string, propertiesChanged:any): Observable<any> {
    const date = new Date();
    const formattedDate = this.formatDate(date);
    const logEntry = {
      timestamp: formattedDate.toISOString(),
      propertiesChanged,
      message,
      username,
      logType:3
    };
    return this.sendLogToServer(logEntry).pipe(
      tap(() => {
        // Update userLogs BehaviorSubject after posting the log
        const updatedLogs = [...this.userLogs$.value, logEntry];
        this.userLogs$.next(updatedLogs);
      })
    );
  }

  logPostBloqueos(message: string, username: string, bloquedProperties:any):Observable<any>{
    const date = new Date();
    const formattedDate = this.formatDate(date); 
    const logEntry = {
      timestamp: formattedDate.toISOString(),
      propertiesChanged:bloquedProperties,
      message,
      username,
      logType:4
    };
    return this.sendLogToServer(logEntry).pipe(
      tap(() => {
        // Update userLogs BehaviorSubject after posting the log
        const updatedLogs = [...this.userLogs$.value, logEntry];
        this.userLogs$.next(updatedLogs);
      })
    );
  }

  /**      const pago: edoCuenta = {
        Folio: this.currentHuesped.folio,
        Fecha: new Date(),
        Fecha_Cancelado: '',
        Referencia: this.abonosf.notaAbono.value,
        Descripcion: this.abonosf.conceptoManual.value,
        Forma_de_Pago: this.abonosf.formaDePagoAbono.value,
        Cantidad: 1,
        Cargo: 0,
        Abono: this.abonosf.cantidadAbono.value,
        Estatus: 'Activo'
      }; */
  logPagos(message: string, username: string, payment:any):Observable<any>{
    const date = new Date();
    const formattedDate = this.formatDate(date); 
    const logEntry = {
      timestamp: formattedDate.toISOString(),
      payment:payment,
      message,
      username,
      logType:5
    };
    return this.sendLogToServer(logEntry).pipe(
      tap(() => {
        // Update userLogs BehaviorSubject after posting the log
        const updatedLogs = [...this.userLogs$.value, logEntry];
        this.userLogs$.next(updatedLogs);
      })
    );
  }

  formatDate(date: Date): Date {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // return `${day} ${month} ${hours}:${minutes}`;
    return date
  // Optional: Method to send log to the server
  // private sendLogToServer(logEntry: { timestamp: Date; message: string }) {
  //   // Implement the logic to send logs to the server
   }

   /**Helpers two compare Objects */
   getChangedProperties(obj1: any, obj2: any): Record<string, any> {
    const changedProperties: Record<string, any> = {};
  
    function findChanges(obj1: any, obj2: any, parentKey: string = ''): void {
      for (const key in obj2) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
  
        if (!(key in obj1)) {
          // If the key does not exist in obj1, we skip it.
          continue;
        } else if (typeof obj2[key] === 'object' && obj2[key] !== null && typeof obj1[key] === 'object' && obj1[key] !== null) {
          // If both properties are objects, recurse
          findChanges(obj1[key], obj2[key], fullKey);
        } else if (obj1[key] !== obj2[key]) {
          // Property value is different, add to changedProperties
          changedProperties[fullKey] = obj2[key];
        }
      }
    }
  
    findChanges(obj1, obj2);
  
    return changedProperties;
  }
  
}