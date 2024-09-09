import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Bloqueo, BloqueosState } from '../_metronic/layout/components/header/bloqueos/_models/bloqueo.model';
import { ParametrosService } from '../pages/parametros/_services/parametros.service';
import { LocalForageCache } from '../tools/cache/indexdb-expire';
import { SortDirection } from '@angular/material/sort';



@Injectable({
  providedIn: 'root'
})
export class BloqueoService  {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Bloqueos',
    defaultExpiration: 10800
});

private currentBloqueos$=new BehaviorSubject<Bloqueo[]>([]);
private currentBloqueosSubject =new Subject<any>();

    constructor(private http: HttpClient) { }

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

    get getcurrentBloqueosValue(){
      return this.currentBloqueos$;
    }
  
    set setcurrentBloqueosValue(habitacion: any) {
      this.currentBloqueos$.next(habitacion);
    }

    async sendCustomFormNotification(_nuevoDatoAgregado:boolean){
      if(_nuevoDatoAgregado=true){
        this.currentBloqueosSubject.next(true)
      }
    };

    getcustomFormNotification() {
      return this.currentBloqueosSubject.asObservable();
    }

    getAll() :Observable<Bloqueo[]> {
      return this.http
       .get<Bloqueo[]>(environment.apiUrl + '/bloqueos/getAll')
       .pipe(
         map(responseData=>{
          const postArray = []
           for(const key in responseData)
           {
             if(responseData.hasOwnProperty(key))
             postArray.push(responseData[key]);
            }
            this.writeIndexDB("Bloqueos",responseData);
            this.setcurrentBloqueosValue = responseData 
  
            return responseData
       })
       )
     }

     postBloqueo(
      desde: Date,
      hasta: Date,
      cuarto: string,
      numCuarto: Array<string>,
      checkboxState: BloqueosState,
      comentarios: string
    ) {
      const bloqueoPayload: Bloqueo = {
        Habitacion: cuarto,
        Cuarto: numCuarto,
        Desde: desde,
        Hasta: hasta,
        bloqueoState: checkboxState,
        Comentarios: comentarios,
      };
    
      return this.http.post<{ message: string }>(`${environment.apiUrl}/post/bloqueos`, bloqueoPayload).pipe(
        map(response => {
          if (response.message === 'Bloqueo guardado con éxito') {
            // Fetch the updated list of bloqueos and update IndexedDB
            this.getAll().subscribe({
              next:(updatedBloqueos)=>{
                this.writeIndexDB('Bloqueos', updatedBloqueos);
              },
              error:(error) => {
                console.error('Error fetching updated bloqueos:', error);
              }
            });
          }
          return response;
        })
      );
    }

     /**POR BORRAR */

  getBloqueosbyTipo(id:string) : Observable<Bloqueo[]> {
  return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/reportes/bloqueos/"+id)
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }

  getBloqueosbyId(id:string) : Observable<Bloqueo[]> {
    return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/get/bloqueos/"+id)
        .pipe(
          map(responseData=>{

            console.log("MAP",responseData)
            return responseData
          })
        ))
    }

  actualizaBloqueos(
    _id:string,
    desde:Date,
    hasta:Date,
    cuarto:string,
    numCuarto:Array<string>,
    bloqueosState:BloqueosState,
    comentarios:string
    ) {


      let bloqueos: Bloqueo = {
                                _id:_id,
                                Habitacion:cuarto,
                                Cuarto:numCuarto,
                                Desde:desde,
                                Hasta:hasta,
                                bloqueoState:bloqueosState,
                                Comentarios:comentarios.trim(),
                                };

   return this.http.post<Bloqueo>(environment.apiUrl+"/actualiza/bloqueos", {bloqueos},{observe:'response'})

      }


  deleteBloqueo(id:any) {
   return this.http.delete(environment.apiUrl + "/reportes/borrar-bloqueo/"+id,{observe:'response'})

  }


  getBloqueos() :Observable<Bloqueo[]> {
   return this.http
    .get<Bloqueo[]>(environment.apiUrl + '/reportes/bloqueos')
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }


      liberaBloqueos(
        _id:string,
        desde:Date,
        hasta:Date,
        habitacion:string,
        numCuarto:Array<string>,
        ) {

          let bloqueos: Bloqueo = {
                                    _id:_id,
                                    Habitacion:habitacion,
                                    Cuarto:numCuarto,
                                    Desde:desde,
                                    Hasta:hasta,
                                    bloqueoState:{
                                      sinLlegadas:false,
                                      sinSalidas:false,
                                      fueraDeServicio:false
                                    },
                                    Comentarios:'',
                                    };

      return this.http.post<Bloqueo>(environment.apiUrl+"/libera/bloqueos", {bloqueos})

      }

}
