import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { GroupingState } from 'src/app/_metronic/shared/models/grouping.model';
import { PaginatorState } from 'src/app/_metronic/shared/models/paginator.model';
import { SortState } from 'src/app/_metronic/shared/models/sort.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { environment } from 'src/environments/environment';
import { RoomsComponent } from './rooms/rooms.component';
import { MatTableDataSource } from '@angular/material/table';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';

@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogsComponent{


  
  constructor(
    ){

  }
  
}
