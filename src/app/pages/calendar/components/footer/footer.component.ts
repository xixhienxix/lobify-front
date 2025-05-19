import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Huesped } from 'src/app/models/huesped.model';
import { HouseKeeping } from '../../_models/housekeeping.model';
import { Habitacion } from 'src/app/models/habitaciones.model';

export interface IStatusArray {
  huespedEnCasa:Huesped[],
  reservaSinPago:Huesped[],
  reservaConfirmada:Huesped[],
  checkOuts:Huesped[],
  usoInterno:Huesped[],
  bloqueo:Huesped[],
  reservaTemp:Huesped[]
}

export interface IHouseKeepingStatusArray {
  limpiando:Habitacion[],
  limpias:Habitacion[],
  retocar:Habitacion[],
  sucias:Habitacion[],
  bloqueadas:Habitacion[],
}


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnChanges{
  private statusMap: { [key: string]: keyof IStatusArray } = {
    'Huesped en Casa': 'huespedEnCasa',
    'Reserva Sin Pagar': 'reservaSinPago',
    'Reserva Confirmada': 'reservaConfirmada',
    'Hizo Checkout': 'checkOuts',
    'Uso Interno': 'usoInterno',
    'Bloqueo': 'bloqueo',
    'Reserva Temporal': 'reservaTemp'
  };

  private statusHouseKeepingMap: { [key: string]: keyof IHouseKeepingStatusArray } = {
    'RETOCAR': 'retocar',
    'LIMPIANDO': 'limpiando',
    'SUCIA': 'sucias',
    'LIMPIA': 'limpias'
  };

  reservationsStatus:IStatusArray = {
  huespedEnCasa:[]=[],
  reservaSinPago:[]=[],
  reservaConfirmada:[]=[],
  checkOuts:[]=[],
  usoInterno:[]=[],
  bloqueo:[]=[],
  reservaTemp:[]=[]
  }
  housekeepingStatus:IHouseKeepingStatusArray ={
    limpiando:[]=[],
    limpias:[]=[],
    retocar:[]=[],
    sucias:[]=[],
    bloqueadas:[]=[],
  }

  @Input() allReservations: Huesped[];
  @Input() houseKeepingCodes: Habitacion[];
  
  constructor(){

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    (Object.keys(this.reservationsStatus) as Array<keyof IStatusArray>).forEach(key => {
      this.reservationsStatus[key] = [];
    });
    (Object.keys(this.housekeepingStatus) as Array<keyof IHouseKeepingStatusArray>).forEach(key => {
      this.housekeepingStatus[key] = [];
    });
    
    
    const today = new Date();
  
    if (changes.allReservations) {
      this.allReservations.forEach(item => {
        const arrivalDate = new Date(item.llegada);
        const departureDate = new Date(item.salida);
  
        // Check if today's date is within the arrival and departure dates
        if (arrivalDate <= today && today <= departureDate) {
          const statusKey = this.statusMap[item.estatus];
          if (statusKey) {
            this.reservationsStatus[statusKey].push(item);
          }
        }
      });    
    }
  
    if (changes.houseKeepingCodes) {
      this.houseKeepingCodes.forEach(item=>{
        const statusKey = this.statusHouseKeepingMap[item.Estatus];
        if(statusKey){
          this.housekeepingStatus[statusKey].push(item);
        }
      })  
    }
  }

}
