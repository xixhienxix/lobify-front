import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { edoCuenta } from "../models/edoCuenta.model";
import { ParametrosService } from "../pages/parametros/_services/parametros.service";
import { AuthService } from "../modules/auth";
import { LogService } from "./activity-logs.service";

const EMPTY_EDO = {
  Folio:0,
  Referencia:'',
  Forma_de_Pago:'',
  Fecha:new Date(),
  Descripcion:'',
  Cantidad:1,
  Cargo:0,
  Abono:0,
}

@Injectable({ providedIn: 'root' })
export class Edo_Cuenta_Service {

    public edoCuentaSubject = new BehaviorSubject<edoCuenta[]>([])
    public subject =new Subject<any>();
    currentUser:string='root'

sendNotification(value:any){
    this.subject.next({text:value});
}

//this will be subscribed by the listing component which needs to display the //added/deleted ie updated list.

getNotification(){
    return this.subject.asObservable();
}

    get currentCuentaValue(): edoCuenta[] {
      return this.edoCuentaSubject.value;
    }
  
    set currentCuentaValue(user: edoCuenta[]) {
      this.edoCuentaSubject.next(user);
    }

    constructor(
                private http: HttpClient, 
              ) {
               }

               agregarPago(edoCuenta: edoCuenta) {
                return this.http
                  .post<{ message: string; data: edoCuenta }>(
                    `${environment.apiUrl}/edo_cuenta/pagos`,
                    { edoCuenta }
                  )
                  .pipe(
                    map((response) => {
                      this.sendNotification(true);
                      return response; // Ensure the response is returned
                    })
                  );
              }

    agregarHospedaje(edoCuenta:edoCuenta[]){
      return this.http.post<edoCuenta>(environment.apiUrl+'/edo_cuenta/hospedaje',{edoCuenta}).pipe(
        map((data=>{
          this.sendNotification(true);
          }
      )));
    }

    updateRow(_id:string,estatus:string,fechaCancelado:Date,autorizo:string){

      return this.http.put(environment.apiUrl+"/edo_cuenta/pagos",{_id,estatus,fechaCancelado,autorizo}).pipe(
        map((data=>{
          this.sendNotification(true);
          }
      )));;
    }

    updateRowByConcepto(folio:string,concepto:string,edoCuenta:edoCuenta){
      return this.http.put(environment.apiUrl+"/edo_cuenta/update/concepto",{folio,concepto,edoCuenta}).pipe(
        map((data=>{
          this.sendNotification(true);
          }
      )));;
    }

    getCuentas(folio:string ){
        return this.http.get<edoCuenta[]>(environment.apiUrl+'/edo_cuenta/'+folio)
        .pipe(
            map((datosCuenta)=>{
            let estadoDeCuenta:edoCuenta[]=[];
              for(var i in datosCuenta)
              {
                if(datosCuenta.hasOwnProperty(i))
                {
                    estadoDeCuenta.push(datosCuenta[i])
                }
              }
              this.edoCuentaSubject = new BehaviorSubject<edoCuenta[]>(estadoDeCuenta);
              this.currentCuentaValue = estadoDeCuenta
              
              return estadoDeCuenta    
          }))
        

    }

    getTodasLasCuentas(){
      return this.http.get<edoCuenta[]>(environment.apiUrl+'/ingresos/totales')
      .pipe(
          map((datosCuenta)=>{
          let estadoDeCuenta:edoCuenta[]=[];
            for(var i in datosCuenta)
            {
              if(datosCuenta.hasOwnProperty(i))
              {
                  estadoDeCuenta.push(datosCuenta[i])
              }
            }

            return estadoDeCuenta    
        }))
      
  }

  actualizaSaldo(folio:string,monto:number){
    return this.http.put<edoCuenta>(environment.apiUrl+'/edo_cuenta/alojamiento',{folio,monto})
  }

  actualizaTotales(folio:string){
    return this.http.post<edoCuenta>(environment.apiUrl+'/edo_cuenta/totales',{folio})
  }

}