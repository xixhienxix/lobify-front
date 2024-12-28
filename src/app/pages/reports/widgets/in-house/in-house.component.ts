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
import { DateTime } from 'luxon'
@Component({
  selector: 'app-in-house',
  templateUrl: './in-house.component.html',
  styleUrls: ['./in-house.component.scss']
})
export class InHouseComponent implements OnInit{
  huespedEnCasa: Huesped[] = [];
  inventario: number = 0;
  disponibles: Huesped[] = [];
  porLlegar:Huesped[]=[];
  avaibleRooms:number=0;

  @Input() changing: Subject<Huesped[]>;

  @Input() color: string = '';
  @Input() allReservations: Huesped[] = [];
  @Input() houseKeepingCodes: HouseKeeping[] = [];
  @Input() codigosCargo: Codigos[] = [];
  @Input() estatusArray: Estatus[] = [];
  @Input() ratesArrayComplete: Tarifas[] = [];
  @Input() roomCodesComplete: Habitacion[] = [];
  @Input() parametrosModel: Parametros;
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
        const filterByStatus = (huesped: Huesped, statusIndex: number): boolean => {
          return reservationStatusMap[statusIndex].includes(huesped.estatus);
        };

        const currentDate = DateTime.local().setZone(this.parametrosModel.codigoZona); // Get current local time
        const todayDateString = currentDate.toISODate(); // Today's date in ISO format (YYYY-MM-DD)

        this.inventario = roomSource.length
        console.log('huespedEnCasa',this.huespedEnCasa.length);
        console.log('porLlegar', this.porLlegar.length);

        const colgados = this.allReservations.filter(
          (huesped) =>
            DateTime.fromISO(huesped.salida).toISODate()! <= todayDateString! &&
            filterByStatus(huesped, 1)
        ).length;

        this.avaibleRooms = Math.max(0, roomSource.length - (((this.huespedEnCasa.length) - colgados) + this.porLlegar.length));

        this.cdr.detectChanges(); // Manually trigger change detction if needed
      }
    })
  }

  processReservations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.huespedEnCasa = [];
    this.disponibles = [];

    this.allReservations.forEach(item => {
      
      const llegada = new Date(item.llegada);
      const salida = DateTime.fromISO(item.salida).setZone(this.parametrosModel.codigoZona);
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
