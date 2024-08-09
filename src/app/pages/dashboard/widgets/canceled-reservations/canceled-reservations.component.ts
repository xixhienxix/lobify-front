import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Huesped } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-canceled-reservations',
  templateUrl: './canceled-reservations.component.html',
  styleUrls: ['./canceled-reservations.component.scss']
})
export class CanceledReservationsComponent implements OnInit {
  reservasCanceladas:Huesped[]=[];

  @Input() changing: Subject<Huesped[]>;
  @Input() allReservations: Huesped[] = [];

  constructor(private cdr: ChangeDetectorRef){
  }

  async ngOnInit() {
      this.changing.subscribe({
        next:async (dataSource)=>{
          this.allReservations = [...dataSource];
          this.processReservations();
          this.cdr.detectChanges(); // Manually trigger change detection if needed
  
        }
      })
    }

    processReservations() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      this.reservasCanceladas = [];

      this.allReservations.forEach(item => {
        const llegada = new Date(item.llegada);
        llegada.setHours(0, 0, 0, 0);
  
        if (llegada.getTime() === today.getTime()) {
          if (item.origen === 'Reserva' && item.estatus === 'Reserva Cancelada') {
            this.reservasCanceladas.push(item);
          } 
        }
      });
    }
}
