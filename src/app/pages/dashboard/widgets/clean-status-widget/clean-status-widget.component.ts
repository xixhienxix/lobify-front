import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';

@Component({
  selector: 'app-clean-status-widget',
  templateUrl: './clean-status-widget.component.html',
  styleUrls: ['./clean-status-widget.component.scss']
})
export class CleanStatusWidgetComponent implements OnInit{
  roomCodesComplete:Habitacion[]=[]
  limpias:Habitacion[]=[];
  sucias:Habitacion[]=[];
  limpiando:Habitacion[]=[];
  retocar:Habitacion[]=[];

  @Input() changingValueRooms: Subject<Habitacion[]>;

  constructor(private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ){
    this.translateService.use('es');
  }
  ngOnInit(): void {
    this.changingValueRooms.subscribe({
      next:(roomSource)=>{
        this.roomCodesComplete = [...roomSource];
        this.processRoomHouseKeepingStatus();
        this.cdr.detectChanges(); // Manually trigger change detection if needed
      }
    })
  }

  processRoomHouseKeepingStatus() {

    this.roomCodesComplete.forEach(item => {
        if (item.Estatus === 'RETOCAR') {
          this.retocar.push(item);
        } if (item.Estatus === 'LIMPIA') {
          this.limpias.push(item);
        } if (item.Estatus === 'SUCIA') {
          this.sucias.push(item);
        } if (item.Estatus === 'LIMPIANDO') {
          this.limpiando.push(item);
        }
      
    });
  }

}
