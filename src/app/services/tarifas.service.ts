import { HttpClient,  } from '@angular/common/http';
import {  Injectable,  } from '@angular/core';
import { BehaviorSubject,  Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Tarifas } from '../models/tarifas';
import { LocalForageCache } from '../tools/cache/indexdb-expire';





@Injectable({
  providedIn: 'root'
})
export class TarifasService {
  indexDBStorage = new LocalForageCache().createInstance({
    name: 'Lobify',
    storeName: 'Rates',
    defaultExpiration: 10800
});

  API_URL = `${environment.apiUrl}/tarifario/Tarifas`;
  /*Oservables*/
  TarifasUpdate$: Observable<Tarifas[]>;
  private currentTarifas$=new BehaviorSubject<Tarifas[]>([]);
  private currentTarifasSubject =new Subject<any>();

  private subject =new Subject<any>();

  constructor(private http: HttpClient) {
    this.TarifasUpdate$=this.currentTarifas$.asObservable();
  }

  sendNotification(value:any)
  {
      this.subject.next({text:value});
  }

  getNotification(){
      return this.subject.asObservable();
  }

  get getCurrentTarifasValue() {
    return this.currentTarifas$;
  }

  set setCurrentTarifasValue(Tarifas: any) {
    this.currentTarifas$.next(Tarifas);
    this.sendCustomFormNotification(true);

  }

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

  async sendCustomFormNotification(flag:boolean){
    await this.deleteIndexDB("Rates");
    this.getAll();
    this.currentTarifasSubject.next(flag)
  }

  getAll() :Observable<Tarifas[]> {
    return this.http
     .get<any[]>(environment.apiUrl + '/tarifario/tarifas')
     .pipe(
       map(responseData=>{
        // responseData.forEach((item)=>{
        //   if(item.hasOwnProperty('_id')){
        //     delete item._id;   
        //   }
        // })
        this.writeIndexDB("Rates",responseData);
        this.setCurrentTarifasValue = responseData 
        return responseData
     })
     )
   }

   getTarifaRack() :Observable<Tarifas[]> {
    return this.http
     .get<Tarifas[]>(environment.apiUrl + '/tarifario/tarifas/rack')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  postTarifa(tarifa:Tarifas){
    console.log("tarifaBAe Add New :", tarifa)
    return this.http.post(environment.apiUrl+'/tarifas/agregar',{tarifa}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ))
  }


  postTarifaEspecial(tarifa:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifas/especial/agregar',{tarifa}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ));
  }

  updateTarifas(tarifas:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifario/actualiza/tarifas',{tarifas}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ))
  }

  updateTarifaBase(tarifas:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifario/actualiza/tarifaBase',{tarifas}).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ))
  }

  updateTarifasModifica(TarifasAnterior:any)
  {
    return this.http
    .post(environment.apiUrl+'/tarifario/actualiza/tarifas/modifica',{TarifasAnterior})
  }

  modificaTarifas(codigo:string, numero:string, llegada:string, salida:string)
  {
    return this.http
    .post(environment.apiUrl+'/tarifario/actualiza/tarifas',{codigo:codigo,numero:numero,llegada:llegada,salida:salida})
  }

  deleteTarifaEspecial(tarifa:Tarifas){
    return this.http.delete(environment.apiUrl+'/tarifas/especial/delete/'+tarifa._id,).pipe(
      map(()=>{
        this.sendNotification(true);
        }
    ));
  }

  /** Rates Calculator */

  ratesTotalCalc(
    tarifa: Tarifas,
    standardRatesArray: Tarifas[],
    tempRatesArray: Tarifas[],
    codigosCuarto: string,
    adultos: number,
    ninos: number,
    initialDate: Date,
    endDate: Date
): { fecha: string; tarifaTotal: number }[] { // Adjusted return type to string for fecha
    const results: { fecha: string; tarifaTotal: number }[] = []; // Adjusted fecha to string

    const applyRate = (item: any, date: Date) => {
        let rate = 0;
        switch (adultos) {
            case 1:
                rate = item.Tarifa_1;
                break;
            case 2:
                rate = item.Tarifa_2;
                break;
            case 3:
                rate = item.Tarifa_3;
                break;
            default:
                rate = item.Tarifa_3;
        }

        let tarifaTotal = rate * adultos;
        if (ninos !== 0) {
            tarifaTotal += item.Tarifa_N * ninos;
        }

        // Translate date to 'es-MX' format
        const formattedDate = new Intl.DateTimeFormat('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);

        results.push({ fecha: formattedDate, tarifaTotal });
    };

    for (let start = new Date(initialDate); start < endDate; start.setDate(start.getDate() + 1)) {
        let dailyTarifaTotal = 0;
        let tarifaAplicada = false;

        if (tarifa.Tarifa !== 'Tarifa Base' && tarifa.Estado) {
            const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
            const day = start.getDay();

            tarifa.TarifasActivas.forEach(item => {
                const validDay = item.Dias?.some(x => x.name === dayNames[day] && x.checked);
                if (validDay && item.Activa) {
                    applyRate(item, start);
                    tarifaAplicada = true;
                }
            });
        }

        if (!tarifaAplicada) {
            dailyTarifaTotal = this.retriveBaseRatePrice(
                codigosCuarto,
                start,
                standardRatesArray,
                adultos,
                ninos,
                tempRatesArray
            );

            // Translate date to 'es-MX' format
            const formattedDate = new Intl.DateTimeFormat('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).format(start);

            results.push({ fecha: formattedDate, tarifaTotal: dailyTarifaTotal });
        }
    }

    return results;
}


  

  retriveBaseRatePrice(
    codigosCuarto: string, 
    checkDay: Date, 
    standardRatesArray: Tarifas[], 
    adultos: number, 
    ninos: number, 
    tempRatesArray: Tarifas[]
  ): number {
    const tarifaBase = standardRatesArray.find(obj => obj.Habitacion.includes(codigosCuarto));
    const tarifaTemporada = this.checkIfTempRateAvaible(
      codigosCuarto, 
      checkDay, 
      tempRatesArray, 
      adultos, 
      ninos
    );
  
    if (tarifaTemporada !== 0) {
      return Math.ceil(tarifaTemporada);
    }
  
    let tarifaTotal = 0;
    if (tarifaBase) {
      tarifaBase.TarifasActivas.forEach(item => {
        let rate = 0;
        switch (adultos) {
          case 1:
            rate = item.Tarifa_1;
            break;
          case 2:
            rate = item.Tarifa_2;
            break;
          case 3:
            rate = item.Tarifa_3;
            break;
          default:
            rate = item.Tarifa_3;
        }
        tarifaTotal += rate * adultos;
        if (ninos !== 0) {
          tarifaTotal += item.Tarifa_N * ninos;
        }
      });
    }
    return Math.ceil(tarifaTotal);
  }
  
  checkIfTempRateAvaible(
    codigoCuarto: string, 
    fecha: Date, 
    tempRatesArray: Tarifas[], 
    adultos: number, 
    ninos: number
  ): number {
    const tarifaTemporada = tempRatesArray.find(obj => obj.Habitacion.includes(codigoCuarto));
    if (!tarifaTemporada) return 0;
  
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const day = fecha.getDay();
    const validDay = tarifaTemporada.TarifasActivas[0]?.Dias?.some(
      x => x.name === dayNames[day] && x.checked
    );
  
    if (validDay && tarifaTemporada.Estado) {
      let tarifaTotal = 0;
      tarifaTemporada.TarifasActivas.forEach(item => {
        let rate = 0;
        switch (adultos) {
          case 1:
            rate = item.Tarifa_1;
            break;
          case 2:
            rate = item.Tarifa_2;
            break;
          case 3:
            rate = item.Tarifa_3;
            break;
          default:
            rate = item.Tarifa_3;
        }
        tarifaTotal += rate * adultos;
        if (ninos !== 0) {
          tarifaTotal += item.Tarifa_N * ninos;
        }
      });
      return Math.ceil(tarifaTotal);
    }
    return 0;
  }
  

}
