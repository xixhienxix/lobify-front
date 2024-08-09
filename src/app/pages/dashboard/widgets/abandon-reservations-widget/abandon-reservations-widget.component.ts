import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Huesped } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-abandon-reservations-widget',
  templateUrl: './abandon-reservations-widget.component.html',
  styleUrls: ['./abandon-reservations-widget.component.scss']
})
export class AbandonReservationsWidgetComponent implements OnInit {
  reservacionesAbandonadas:Huesped[]=[];

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
  
      this.reservacionesAbandonadas = [];

      this.allReservations.forEach(item => {
        // const llegada = new Date(item.llegada);
        // llegada.setHours(0, 0, 0, 0);
  
        // if (llegada.getTime() >= today.getTime()) {
        //   if (item.estatus === 'Reserva Temporal') {
        //     this.reservasTemporales.push(item);
        //   } 
        // }
      });
    }
}
