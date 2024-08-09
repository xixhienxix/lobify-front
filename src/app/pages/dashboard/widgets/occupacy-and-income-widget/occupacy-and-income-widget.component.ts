import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-occupacy-and-income-widget',
  templateUrl: './occupacy-and-income-widget.component.html',
  styleUrls: ['./occupacy-and-income-widget.component.scss']
})
export class OccupacyAndIncomeWidgetComponent implements OnInit{
  porcentajeOcupaccion:Huesped[]=[];
  inventario:Habitacion[]=[];
  @Input() allReservations: Huesped[];
  @Input() changing: Subject<Huesped[]>;
  @Input() changingValueRooms: Subject<Habitacion[]>;

  constructor(private cdr: ChangeDetectorRef){
  }

  ngOnInit(): void {
    this.changing.subscribe({
      next:async (dataSource)=>{
        this.allReservations = [...dataSource];
        this.processReservations();
        this.cdr.detectChanges(); // Manually trigger change detection if needed

      }
    })
    this.changingValueRooms.subscribe({
      next:(roomSource)=>{
        this.inventario = [...roomSource]
        this.cdr.detectChanges(); // Manually trigger change detection if needed
      }
    })
  }

  processReservations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.allReservations.forEach(item => {
      const llegada = new Date(item.salida);
      llegada.setHours(0, 0, 0, 0);

      if (llegada.getTime() === today.getTime()) {
        if(item.estatus === 'Reserva Confirmada' || item.estatus === 'Deposito Realizado'){
          this.porcentajeOcupaccion.push(item);
        }
      }else if(item.estatus === 'Huesped en Casa'){
        this.porcentajeOcupaccion.push(item);
      }
    });
  }
}
