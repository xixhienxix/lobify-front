import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped } from 'src/app/models/huesped.model';

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
        this.avaibleRooms = (roomSource.length-(this.huespedEnCasa.length - this.porLlegar.length))
        this.cdr.detectChanges(); // Manually trigger change detection if needed
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

        if (item.estatus === 'Huesped en Casa') {
          this.huespedEnCasa.push(item);
        } 
        if (llegada.getTime() === today.getTime()) {
          if (item.origen === 'Reserva') {
            this.porLlegar.push(item);
        }          
        }
    });

  }
}
