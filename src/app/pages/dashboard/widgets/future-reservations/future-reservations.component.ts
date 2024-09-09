import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-future-reservations',
  templateUrl: './future-reservations.component.html',
  styleUrls: ['./future-reservations.component.scss']
})
export class FutureReservationsComponent implements OnInit {
  reservasFuturas:Huesped[]=[];

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
  
      this.reservasFuturas = [];

      this.allReservations.forEach(item => {
        const llegada = new Date(item.llegada);
        llegada.setHours(0, 0, 0, 0);
  
        if (llegada.getTime() !== today.getTime() && llegada.getTime() > today.getTime()) {
          if (reservationStatusMap[2].includes(item.estatus)) {
            this.reservasFuturas.push(item);
          } 
        }
      });
    }
  
}
