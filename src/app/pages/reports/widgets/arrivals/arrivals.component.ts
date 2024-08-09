import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Huesped } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-arrivals',
  templateUrl: './arrivals.component.html',
  styleUrls: ['./arrivals.component.scss']
})
export class ArrivalsComponent implements OnInit{
  llegadasDelDia: Huesped[] = [];
  yaLlegaron: Huesped[] = [];
  porLlegar: Huesped[] = [];
  @Input() changing: Subject<Huesped[]>;

  @Input() color: string = '';
  @Input() allReservations: Huesped[] = [];

  customers!: any[];

  constructor(
    private translateService:TranslateService, 
    private cdr: ChangeDetectorRef){
    this.translateService.use('es');
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

    this.llegadasDelDia = [];
    this.yaLlegaron = [];
    this.porLlegar = [];

    this.allReservations.forEach(item => {
      const llegada = new Date(item.llegada);
      llegada.setHours(0, 0, 0, 0);

      if (llegada.getTime() === today.getTime()) {
        this.llegadasDelDia.push(item);

        if (item.origen === 'Walk-In') {
          this.yaLlegaron.push(item);
        } else if (item.origen === 'Reserva') {
          this.porLlegar.push(item);
        }
      }
    });
  }
}
