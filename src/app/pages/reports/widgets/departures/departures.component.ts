import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Codigos } from 'src/app/models/codigos.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';

@Component({
  selector: 'app-departures',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent implements OnInit{
  salidasDelDia: Huesped[] = [];
  yaSeFueron: Huesped[] = [];
  porSalir: Huesped[] = [];

  @Input() allReservations: Huesped[];
  @Input() changing: Subject<Huesped[]>;
  @Input() changingValueRooms: Subject<Habitacion[]>;


  constructor(private translateService : TranslateService,
    private cdr: ChangeDetectorRef
  ){
    this.translateService.use('es')
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

    this.salidasDelDia = [];
    this.yaSeFueron = [];
    this.porSalir = [];

    this.allReservations.forEach(item => {
      const salida = new Date(item.salida);
      salida.setHours(0, 0, 0, 0);

      if (salida.getTime() === today.getTime()) {
        this.salidasDelDia.push(item);

        if (item.estatus === 'Check-Out') {
          this.yaSeFueron.push(item);
        }if (item.estatus === 'Huesped en Casa') {
          this.porSalir.push(item);
        }
      }
    });
  }
}
