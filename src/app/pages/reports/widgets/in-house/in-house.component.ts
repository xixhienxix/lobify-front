/* eslint-disable @angular-eslint/no-output-on-prefix */
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { Codigos } from 'src/app/models/codigos.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';

@Component({
  selector: 'app-in-house',
  templateUrl: './in-house.component.html',
  styleUrls: ['./in-house.component.scss']
})
export class InHouseComponent implements OnInit{
  huespedEnCasa: Huesped[] = [];
  inventario: Habitacion[] = [];
  disponibles: Huesped[] = [];
  porLlegar:Huesped[]=[];
  avaibleRooms:number=0;

  @Input() allReservations: Huesped[];
  @Input() changing: Subject<Huesped[]>;
  @Input() changingValueRooms: Subject<Habitacion[]>;

 

  constructor(private cdr: ChangeDetectorRef){

  }
  async ngOnInit() {
    this.changing.subscribe({
      next:async (dataSource)=>{
        this.allReservations = [...dataSource];
        this.processReservations();
        this.cdr.detectChanges(); // Manually trigger change detection if needed
      }
    });
    this.changingValueRooms.subscribe({
      next:(roomSource)=>{
        this.inventario = [...roomSource]
        this.avaibleRooms = Math.max(0, roomSource.length - (this.huespedEnCasa.length + this.porLlegar.length));
        console.log("Huespede En Casa", this.huespedEnCasa)
        console.log("porLlegar En Casa", this.porLlegar)
        this.cdr.detectChanges(); // Manually trigger change detction if needed
      }
    })
  }

  processReservations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.huespedEnCasa = [];
    this.inventario = [];
    this.disponibles = [];

    this.allReservations.forEach(item => {
      const llegada = new Date(item.llegada);
      llegada.setHours(0, 0, 0, 0);

        if (reservationStatusMap[1].includes(item.estatus)) {
          this.huespedEnCasa.push(item);
        } 
        if (llegada.getTime() === today.getTime()) {
          if (reservationStatusMap[2].includes(item.estatus)) {
            this.porLlegar.push(item);
        }          
        }
    });
  }

}
