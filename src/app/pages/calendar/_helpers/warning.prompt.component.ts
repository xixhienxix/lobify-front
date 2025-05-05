import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Tarifas, TarifasRadioButton } from 'src/app/models/tarifas';
import { DateTime } from 'luxon'
import { Parametros } from '../../parametros/_models/parametros';
import { TarifasService } from 'src/app/services/tarifas.service';
import { Period } from 'src/app/_metronic/layout/components/header/reservations/nva-reserva/nva-reserva.component';
@Component({
  selector: 'app-warning-prompt',
  templateUrl: './warning.prompt.component.html',
  styleUrls: ['./warning.prompt.component.scss']
})
export class WarningComponent implements OnInit, OnDestroy {
  
  folio:string
  mensaje:string
  alertHeader:string;
  interval:number
  countdown:number=0
  isProgress:boolean
  subscription:Subscription[]=[]
  displayedColumns: string[] = ['Tarifa', '$ Promedio x Noche', 'Total', 'Acciones'];
  stayNights:number=0

  @Input() tarifaEstandarArray:Tarifas[]=[]
  cuarto:string;
  tarifaSeleccionada:TarifasRadioButton[]=[];
  totalSeleccionado:number=0;
  numeroCuarto:number=0;
  currentOverlapRateDays:any[]=[];


  @Input() parametros:Parametros
  @Input() ratesArrayComplete:Tarifas[]
  @Input() StartTime:Date = new Date();
  @Input() EndTime:Date = new Date();
  @Input() tempRatesArray:Tarifas[]
  @Input() Adultos:number=1;
  @Input() Ninos:number=0;
  @Input() tarifasEspeciales:Tarifas[];
  
  constructor(public modal: NgbActiveModal,
    private _tarifasService: TarifasService
  ) {}

     ngOnInit(): void {
    
        var timer =  interval(1000).pipe(
          take(this.interval)
          );
          const sb = timer.subscribe(x => 
            {
              this.countdown=this.interval-x
              if(this.countdown==1){this.modal.close()}
            })
            
    
      this.subscription.push(sb)
    }

    tarifaRadioButton(tarifas:Tarifas, event:any, codigo:string){
        this.folio
        const checkedStatus = event.source.checked
        const tarifa = tarifas
    
          if(this.tarifaSeleccionada.length > 0){
            const index  = this.tarifaSeleccionada.findIndex(obj =>
              obj.Habitacion.some(item => item === codigo));
    
              if(index != -1){
                this.tarifaSeleccionada[index].checked = checkedStatus
                this.tarifaSeleccionada.splice(index,1);
                this.tarifaSeleccionada.push({...tarifa,checked:checkedStatus})
              }else{
              }if(index === -1){
                this.tarifaSeleccionada.push({...tarifa,checked:checkedStatus})
              }
          }
        else{
          this.tarifaSeleccionada.push({...tarifa,checked:checkedStatus})
         }  
         
         this.totalSeleccionado = this.ratesTotalCalc(tarifa)
      }

      ratesTotalCalc(tarifa: Tarifas, codigosCuarto = this.cuarto, tarifaPromedio = false){
        const rate = this._tarifasService.ratesTotalCalc(
          tarifa,
          this.tarifaEstandarArray,
          this.tempRatesArray,
          codigosCuarto,
          this.Adultos,
          this.Ninos,
          this.StartTime,
          this.EndTime,
          this.stayNights,
          tarifaPromedio,
          false,
        );
    
        // Ensure it always returns a number
        return Array.isArray(rate) ? rate[0]?.tarifaTotal ?? 0 : rate ?? 0;
      }

      // ratesTotalCalc(tarifa: Tarifas, estanciaPorNoche: number, codigosCuarto = this.cuarto, tarifaPromedio = false) {
      //   const adultos = this.Adultos;
      //   const ninos = this.Ninos;
      //   let tarifaTotal = 0;
      
      //   const applyRate = (item: any) => {
      //     let rate = 0;
      //     switch (adultos) {
      //       case 1:
      //         rate = item.Tarifa_1;
      //         break;
      //       case 2:
      //         rate = item.Tarifa_2;
      //         break;
      //       case 3:
      //         rate = item.Tarifa_3;
      //         break;
      //       default:
      //         rate = item.Tarifa_3;
      //     }
      //     tarifaTotal += rate; //     tarifaTotal += rate * adultos; antes se multiplicaba por adulto
      //     if (ninos !== 0) {
      //       tarifaTotal += item.Tarifa_N * ninos;
      //     }
      //   };
      
      //   if (tarifa.Tarifa !== 'Tarifa Base') {
      
      //     // Convert initial and end dates to Luxon DateTime
      //     const initialDateLuxon = DateTime.fromJSDate(this.StartTime, { zone: this.parametros.codigoZona });
      //     const endDateLuxon = DateTime.fromJSDate(this.EndTime, { zone: this.parametros.codigoZona });
      
      //     // Convert tarifa dates to Luxon DateTime
      //     const llegadaDate = DateTime.fromISO(tarifa.Llegada.toString(), { zone: this.parametros.codigoZona });
      //     const salidaDate = DateTime.fromISO(tarifa.Salida.toString(), { zone: this.parametros.codigoZona });
      
      //     // Check if the initial and end dates are within the range
      //     const isWithinRange =
      //       (initialDateLuxon >= llegadaDate && initialDateLuxon <= salidaDate) &&
      //       (endDateLuxon >= llegadaDate && endDateLuxon <= salidaDate);
      
      //     if (isWithinRange) {
      //       if (tarifa.Estado) {
      //         const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
        
      //         for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
      //           tarifa.TarifasActivas.forEach(item => {
      //             const day = start.getDay();
      //             const validDay = item.Dias?.some(x => x.name === dayNames[day] && x.checked);
      //             if (validDay && item.Activa) {
      //               applyRate(item);
      //             } else {
      //               tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start, day);
      //             }
      //           });
      //         }
      //       }
      //     }
      //   } else {
      //     for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
      //       tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start);
      //     }
      //     tarifaTotal = tarifaTotal/this.stayNights
      //   }
      
      //   return tarifaPromedio ? Math.ceil(tarifaTotal / this.stayNights) : tarifaTotal;
      // }
      
      // retriveBaseRatePrice(codigosCuarto: string, checkDay: Date, day:number=-1) {
      //   const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      
      //   const tarifaBase = this.tarifaEstandarArray.find(obj => obj.Habitacion.includes(codigosCuarto));
      //   const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto, checkDay, day);
      
      //   if (tarifaTemporada !== 0) {
      //     return Math.ceil(tarifaTemporada);
      //   }
      
      //   const applyRate = (item: any) => {
      //     let rate = 0;
      //     switch (this.Adultos) {
      //       case 1:
      //         rate = item.Tarifa_1;
      //         break;
      //       case 2:
      //         rate = item.Tarifa_2;
      //         break;
      //       case 3:
      //         rate = item.Tarifa_3;
      //         break;
      //       default:
      //         rate = item.Tarifa_3;
      //     }
      //     tarifaTotal += rate; //     tarifaTotal += rate * adultos; antes se multiplicaba por adulto
      //     if (this.Ninos !== 0) {
      //       tarifaTotal += item.Tarifa_N * this.Ninos;
      //     }
      //   };
      
      //   let tarifaTotal = 0;
      
      //   for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
      //     if (tarifaBase) {
      //       if(tarifaBase.TarifasActivas.length > 0){
      //         if(!tarifaBase.TarifasActivas[0].Activa){
      //           return tarifaTotal += tarifaBase?.TarifaRack ?? 0;
      //         } else {
      //           tarifaBase.TarifasActivas.forEach(item => {
      //             const dayInside = start.getDay();
      //             const validDay = item.Dias?.some(x => x.name === dayNames[dayInside] && x.checked);
            
      //             // Apply the rate if valid, otherwise apply the base rate
      //             if (validDay && item.Activa) {
      //               applyRate(item);
      //             } else{
      //               const baseRate = this.ratesArrayComplete.find(item2 => item2.Tarifa === 'Tarifa Base');
      //               tarifaTotal += baseRate?.TarifaRack ?? 0;          
      //             }
      //           });
      //         }
      //       } else {
      //         tarifaTotal += tarifaBase?.TarifaRack ?? 0;
      //       }
      //     }
      //   }
      
      //   return Math.ceil(tarifaTotal);
      // }
      
      // checkIfTempRateAvaible(codigoCuarto: string, fecha: Date, day:number=-1 ) {
      
      //   const fechaDate = DateTime.fromISO(fecha.toISOString(), { zone: this.parametros.codigoZona });
        
      //   const tarifaTemporada = this.tempRatesArray.find(obj => {
      //     const llegada = DateTime.fromISO(obj.Llegada.toString(), { zone: this.parametros.codigoZona });
      //     const salida = DateTime.fromISO(obj.Salida.toString(), { zone: this.parametros.codigoZona });
      
      //     // Compare DateTime objects
      //     const isWithinRange = fechaDate >= llegada && fechaDate <= salida;
      
      //     return obj.Habitacion.includes(codigoCuarto) && isWithinRange;
      //   });
      //   let tarifaTotal = 0;
      
      
      //     if (!tarifaTemporada) return 0;
      //     const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      
      //     const applyRate = (item: any) => {
      //       let rate = 0;
      //       switch (this.Adultos) {
      //         case 1:
      //           rate = item.Tarifa_1;
      //           break;
      //         case 2:
      //           rate = item.Tarifa_2;
      //           break;
      //         case 3:
      //           rate = item.Tarifa_3;
      //           break;
      //         default:
      //           rate = item.Tarifa_3;
      //       }
      //       tarifaTotal += rate; //     tarifaTotal += rate * adultos; antes se multiplicaba por adulto
      //       if (this.Ninos !== 0) {
      //         tarifaTotal += item.Tarifa_N * this.Ninos;
      //       }
      //     };
      
      //     if(day === -1){
      //       for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
      //         // Check if tarifaTemporada is defined and has TarifasActivas
      //         if (tarifaTemporada && tarifaTemporada.TarifasActivas && tarifaTemporada.TarifasActivas.length > 0) {
      //           if(!tarifaTemporada.TarifasActivas[0].Activa){
      //             return 0
      //           }
      //           tarifaTemporada.TarifasActivas.forEach(item => {
      //             const dayInside = start.getDay();
      //             const validDay = item.Dias?.some(x => x.name === dayNames[dayInside] && x.checked);
            
      //             // Apply the rate if valid, otherwise apply the base rate
      //             if (validDay && item.Activa) {
      //               applyRate(item);
      //             } else{
      //               const baseRate = this.ratesArrayComplete.find(item2 => item2.Tarifa === 'Tarifa Base');
      //               tarifaTotal += baseRate?.TarifaRack ?? 0;          
      //             }
      //           });
      //         }
      //       }
      //       return tarifaTotal
      //     } else {
      //       if (tarifaTemporada && tarifaTemporada.TarifasActivas && tarifaTemporada.TarifasActivas.length > 0) {
      //         tarifaTemporada.TarifasActivas.forEach(item => {
      //           const validDay = item.Dias?.some(x => x.name === dayNames[day] && x.checked);
          
      //           // Apply the rate if valid, otherwise apply the base rate
      //           if (validDay && item.Activa) {
      //             applyRate(item);
      //           } else{
      //             const baseRate = this.ratesArrayComplete.find(item2 => item2.Tarifa === 'Tarifa Base');
      //             tarifaTotal += baseRate?.TarifaRack ?? 0;          
      //           }
      //         });
      //       }
      //       return tarifaTotal
      //     }
      //   }

  roomRates(minihabs:string){
    let availbleRates = this.ratesArrayComplete.filter((item) => item.Estado === true); 

    availbleRates = availbleRates.filter(obj => obj.Habitacion.includes(minihabs));

    // Add date range validation
    availbleRates = availbleRates.filter(item => {
      const llegadaDate = new Date(item.Llegada);
      const salidaDate = new Date(item.Salida);
      
      // // Check if the initial and end dates are within the range
      // const isWithinRange =
      //   (this.StartTime >= llegadaDate && this.StartTime <= salidaDate) &&
      //   (this.EndTime >= llegadaDate && this.EndTime <= salidaDate);
        
      return this.StartTime <= salidaDate && this.EndTime >= llegadaDate;
    });

    availbleRates = availbleRates.filter(item => item.Tarifa !== 'Tarifa De Temporada');

    return availbleRates
  }

  rateDateRange(tarifa: Tarifas): Period[] {
    if (tarifa.Tarifa === 'Tarifa Base') {
      return [];
    }
  
    // Ensure global range is correctly parsed
    const start = DateTime.fromISO(this.StartTime.toISOString()).startOf('day');
    const end = DateTime.fromISO(this.EndTime.toISOString()).endOf('day');
  
    // Parse tarifa date range
    const tarifaStart = DateTime.fromISO(String(tarifa.Llegada)).startOf('day');
    const tarifaEnd = DateTime.fromISO(String(tarifa.Salida)).endOf('day');
  
    // Ensure there is an actual overlap
    if (tarifaEnd < start || tarifaStart > end) {
      console.log('No overlap with global range.');
      return [];
    }
  
    // Calculate the overlapping range
    const overlapStart = tarifaStart < start ? start : tarifaStart;
    const overlapEnd = tarifaEnd > end ? end : tarifaEnd;
  
  
    const availableRanges: Period[] = [{
      from: overlapStart.toFormat("dd 'de' MMMM"),
      to: overlapEnd.toFormat("dd 'de' MMMM"),
    }];
  
    this.currentOverlapRateDays.push({
      tarifa:tarifa.TarifaRack,
      avaibleRanges:availableRanges
    });
  
    return availableRanges;
  }
  
  ngOnDestroy():void
  {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }

}