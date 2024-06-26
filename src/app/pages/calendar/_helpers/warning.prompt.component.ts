import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Tarifas, TarifasRadioButton } from 'src/app/models/tarifas';

@Component({
  selector: 'app-warning-prompt',
  templateUrl: './warning.prompt.component.html',
  styleUrls: ['./warning.prompt.component.scss']
})
export class WarningComponent implements OnInit {
  
  folio:string
  mensaje:string
  alertHeader:string;
  interval:number
  countdown:number=0
  isProgress:boolean
  subscription:Subscription[]=[]
  displayedColumns: string[] = ['Tarifa', '$ Promedio x Noche', 'Total', 'Acciones'];
  stayNights:number=0
  dataSource :any 
  StartTime:Date = new Date();
  EndTime:Date = new Date();
  tarifaEstandarArray:Tarifas[]=[]
  cuarto:string;
  tarifaSeleccionada:TarifasRadioButton[]=[];
  totalSeleccionado:number=0;
  numeroCuarto:number=0;
  
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

  ratesTotalCalc(tarifa:Tarifas, estanciaPorNoche:number){
    if(tarifa.Tarifa === 'Tarifa Estandar'){
      return tarifa.TarifaRack*estanciaPorNoche
    }else {
      let tarifaTotal=0
      const validDays = tarifa.Dias.filter((x)=> x.checked === true)    
      const dayNames = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"]

      for (let start = new Date(this.StartTime); start < this.EndTime; start.setDate(start.getDate() + 1)) {
        const day = start.getDay();
        const validDay = validDays.find((item) => item.name === dayNames[day])?.checked
        
        if(validDay){
          tarifaTotal += tarifa.TarifaRack
        }else{
          const tarifaEstandar  = this.tarifaEstandarArray.filter(obj =>
            obj.Habitacion.some(item => item === this.cuarto)); 
          tarifaTotal += tarifaEstandar[0].TarifaRack  
        }
      }
      return Math.trunc(tarifaTotal)
    }
  }
  
  ngOnDestroy():void
  {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }

}