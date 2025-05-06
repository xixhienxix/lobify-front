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
  desgloseEdoCuenta:{ fecha: string; tarifaTotal: number }[] | number | any[]


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
         
         this.totalSeleccionado = this.ratesTotalCalc(tarifa);

         this.desgloseEdoCuenta = this._tarifasService.ratesTotalCalc(
          this.tarifaSeleccionada[0],
          this.tarifaEstandarArray,
          this.tempRatesArray,
          this.cuarto,
          this.Adultos,
          this.Ninos,
          this.StartTime,
          this.EndTime,
          this.stayNights,
          false,
          false,
          true
        ) ?? [];
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
  
  ngOnDestroy():void{
    this.subscription.forEach(sb=>sb.unsubscribe())
  }

}