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

      ratesTotalCalc(tarifa:Tarifas, estanciaPorNoche:number, codigosCuarto = this.cuarto, tarifaPromedio:boolean = false){

        const adultos = this.Adultos
        const ninos = this.Ninos
        let tarifaTotal = 0;
    
        if(tarifa.Tarifa !== 'Tarifa Base'){
          if(tarifa.Estado === true){
            const dayNames = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
    
            // Cycle All Days
            for (let start = new Date(this.StartTime); start.setHours(0,0,0,0) < this.EndTime.setHours(0,0,0,0); start.setDate(start.getDate() + 1)) {
              tarifa.TarifasActivas.map((item)=>{
                const validDays = item.Dias!.filter((x)=> x.checked === true)    
                const day = start.getDay();
                const validDay = validDays.find((item) => item.name === dayNames[day])?.checked // Revisar si el dia es valido
    
                if(validDay){
                  if(item.Activa === true){
                    switch (adultos) {
                      case 1:
                        tarifaTotal += item.Tarifa_1*(adultos)
                        break;
                      case 2:
                        tarifaTotal += item.Tarifa_2*(adultos)
                        break;
                      case 3:
                        tarifaTotal += item.Tarifa_3*(adultos)
                        break;
                      default:
                        tarifaTotal += (item.Tarifa_3*(adultos))
                    }
                      if(ninos !==0 ){
                        tarifaTotal += (item.Tarifa_N*ninos)
                      }
                  } 
                }else { // La Tarifa Especial No Es Valida para este dia entonses se tomara el precio de la base
                  tarifaTotal += this.retriveBaseRatePrice(codigosCuarto,start);
                }
              });
            }
          }
          // return Math.trunc(tarifa.TarifaRack!*estanciaPorNoche);
    
        }else if(tarifa.Tarifa === 'Tarifa Base'){
          for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
            tarifaTotal += this.retriveBaseRatePrice(codigosCuarto,start);
          }
        }
        if(tarifaPromedio){
          return Math.ceil(tarifaTotal/this.stayNights);
        }else{
          return (tarifaTotal);
        }
      }
    
      retriveBaseRatePrice(codigosCuarto:string, checkDay:Date){
        let tarifaTotal = 0;
        const adultos = this.Adultos
        const ninos = this.Ninos
    
        const tarifaBase = this.tarifaEstandarArray.find(obj =>
          obj.Habitacion.some(item => item === codigosCuarto)); 
    
        const tarifaTemporada = this.checkIfTempRateAvaible(codigosCuarto,checkDay);
    
        if(tarifaTemporada !== 0){
          return Math.ceil(tarifaTemporada)
        }else{
          tarifaBase?.TarifasActivas.map((item)=>{
            switch (adultos) {
              case 1:
                tarifaTotal += item.Tarifa_1*(adultos)
              break;
              case 2:
                tarifaTotal += item.Tarifa_2*(adultos)
              break;
              case 3:
                tarifaTotal += item.Tarifa_3*(adultos)
              break;
              default:
              tarifaTotal += (item.Tarifa_3*(adultos))
              }
    
              if(ninos !==0 ){
                tarifaTotal += (item.Tarifa_N*ninos)}
          });
          return Math.ceil(tarifaTotal);
        }
      }
    
      checkIfTempRateAvaible(codigoCuarto:string, fecha:Date){
        let tarifaTotal = 0;
        const adultos = this.Adultos
        const ninos = this.Ninos
    
        const tarifaTemporada = this.tempRatesArray.filter(obj =>
          obj.Habitacion.some(item => item === codigoCuarto)); 
    
        tarifaTemporada.map(item=>{
            const dayNames = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
            // let secondValidDates
            let validDays = item?.TarifasActivas[0].Dias!.filter((x)=> x.checked === true);
            //Check if Second Temp Rate Exist
            // if(item?.TarifasActivas.length === 2 && validDays === undefined){
            //   secondValidDates = item?.TarifasActivas[1].Dias!.filter((x)=> x.checked === true);
            // }
            // if(secondValidDates){
            //   validDays = secondValidDates;
            // }
    
            const day = fecha.getDay();
            const validDay = validDays.find((item) => item.name === dayNames[day])?.checked
    
            if(validDay){
              if(item.Estado === true) {
                item?.TarifasActivas.map((item)=>{
                  switch (adultos) {
                    case 1:
                      tarifaTotal += item.Tarifa_1*(adultos)
                    break;
                    case 2:
                      tarifaTotal += item.Tarifa_2*(adultos)
                    break;
                    case 3:
                      tarifaTotal += item.Tarifa_3*(adultos)
                    break;
                    default:
                    tarifaTotal += (item.Tarifa_3*(adultos))
                    }
            
                    if(ninos !==0 ){
                      tarifaTotal += (item.Tarifa_N*ninos)}
                });
                return Math.ceil(tarifaTotal);
              }else{
                tarifaTotal=0;
              }
            }else{
              return tarifaTotal=0
            }
        })
        return tarifaTotal
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