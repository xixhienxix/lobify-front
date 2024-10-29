import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Tarifas, TarifasRadioButton } from 'src/app/models/tarifas';

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
  StartTime:Date = new Date();
  EndTime:Date = new Date();
  tarifaEstandarArray:Tarifas[]=[]
  cuarto:string;
  tarifaSeleccionada:TarifasRadioButton[]=[];
  totalSeleccionado:number=0;
  numeroCuarto:number=0;
  @Input() ratesArrayComplete:Tarifas[]
  @Input() tempRatesArray:Tarifas[]
  @Input() Adultos:number=1;
  @Input() Ninos:number=0;
  
  constructor(public modal: NgbActiveModal,
    ) {
     }

     ngOnInit(): void {
    
        var timer =  interval(1000).pipe(
          take(this.interval)
          );
          const sb = timer.subscribe(x => 
            {
              this.countdown=this.interval-x
              console.log(this.interval-x)
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
         
         this.totalSeleccionado = this.ratesTotalCalc(tarifa, this.stayNights)
      }

      ratesTotalCalc(tarifa: Tarifas, estanciaPorNoche: number, codigosCuarto = this.cuarto, tarifaPromedio = false) {
        const adultos = this.Adultos;
        const ninos = this.Ninos;
        let tarifaTotal = 0;
      
        const applyRate = (item: any) => {
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
          tarifaTotal += rate; //     tarifaTotal += rate * adultos; antes se multiplicaba por adulto
          if (ninos !== 0) {
            tarifaTotal += item.Tarifa_N * ninos;
          }
        };
      
        if (tarifa.Tarifa !== 'Tarifa Base') {
      
          // Check if Special Rate is valid for Date Range
          const llegadaDate = new Date(tarifa.Llegada);
          const salidaDate = new Date(tarifa.Salida);
          // Check if the initial and end dates are within the range
          const isWithinRange =
            (this.StartTime >= llegadaDate && this.StartTime <= salidaDate) &&
            (this.EndTime >= llegadaDate && this.EndTime <= salidaDate);
      
          if (isWithinRange) {
            if (tarifa.Estado) {
              const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
        
              for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
                tarifa.TarifasActivas.forEach(item => {
                  const day = start.getDay();
                  const validDay = item.Dias?.some(x => x.name === dayNames[day] && x.checked);
                  if (validDay && item.Activa) {
                    applyRate(item);
                  } else {
                    tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, start, day);
                  }
                });
              }
            }
          }
        } else {
          //for (let start = new Date(this.intialDate); start < this.endDate; start.setDate(start.getDate() + 1)) {
            tarifaTotal += this.retriveBaseRatePrice(codigosCuarto, new Date(this.StartTime));
          //}
        }
      
        return tarifaPromedio ? Math.ceil(tarifaTotal / this.stayNights) : tarifaTotal;
      }
      
      retriveBaseRatePrice(codigosCuarto: string, checkDay: Date, day:number=-1) {
      
        const tarifaBase = this.tarifaEstandarArray.find(obj => obj.Habitacion.includes(codigosCuarto));
        const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto, checkDay, day);
      
        if (tarifaTemporada !== 0) {
          return Math.ceil(tarifaTemporada);
        }
      
      
        let tarifaTotal = 0;
      
        for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
          if (tarifaBase) {
            tarifaTotal += tarifaBase?.TarifaRack ?? 0;
          }
        }
      
        return Math.ceil(tarifaTotal);
      }
      
      checkIfTempRateAvaible(codigoCuarto: string, fecha: Date, day:number=-1 ) {
        const tarifaTemporada = this.tempRatesArray.find(obj => {
          const llegada = new Date(obj.Llegada);
          const salida = new Date(obj.Salida);
        
          // Check if Habitacion includes the specified room code and fecha is within the Llegada and Salida range
          const isWithinRange = llegada <= fecha && fecha <= salida;
            
          return obj.Habitacion.includes(codigoCuarto) && isWithinRange;
        });
        let tarifaTotal = 0;
      
      
          if (!tarifaTemporada) return 0;
          const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      
          const applyRate = (item: any) => {
            let rate = 0;
            switch (this.Adultos) {
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
            tarifaTotal += rate; //     tarifaTotal += rate * adultos; antes se multiplicaba por adulto
            if (this.Ninos !== 0) {
              tarifaTotal += item.Tarifa_N * this.Ninos;
            }
          };
      
          if(day === -1){
            for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
              // Check if tarifaTemporada is defined and has TarifasActivas
              if (tarifaTemporada && tarifaTemporada.TarifasActivas && tarifaTemporada.TarifasActivas.length > 0) {
                tarifaTemporada.TarifasActivas.forEach(item => {
                  const dayInside = start.getDay();
                  const validDay = item.Dias?.some(x => x.name === dayNames[dayInside] && x.checked);
            
                  // Apply the rate if valid, otherwise apply the base rate
                  if (validDay && item.Activa) {
                    applyRate(item);
                  } else{
                    const baseRate = this.ratesArrayComplete.find(item2 => item2.Tarifa === 'Tarifa Base');
                    tarifaTotal += baseRate?.TarifaRack ?? 0;          
                  }
                });
              }
            }
            return tarifaTotal
          } else {
            if (tarifaTemporada && tarifaTemporada.TarifasActivas && tarifaTemporada.TarifasActivas.length > 0) {
              tarifaTemporada.TarifasActivas.forEach(item => {
                const validDay = item.Dias?.some(x => x.name === dayNames[day] && x.checked);
          
                // Apply the rate if valid, otherwise apply the base rate
                if (validDay && item.Activa) {
                  applyRate(item);
                } else{
                  const baseRate = this.ratesArrayComplete.find(item2 => item2.Tarifa === 'Tarifa Base');
                  tarifaTotal += baseRate?.TarifaRack ?? 0;          
                }
              });
            }
            return tarifaTotal
          }
        }

  roomRates(minihabs:string){
    let availbleRates = this.ratesArrayComplete.filter((item) => item.Estado === true); 

    availbleRates  = availbleRates.filter(obj =>
      obj.Habitacion.some(item => item === minihabs));
    
    availbleRates = availbleRates.filter(item => item.Tarifa !== 'Tarifa De Temporada');
    
    return availbleRates
  }
  
  ngOnDestroy():void
  {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }

}