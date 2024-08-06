import { Component,  OnInit,  ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { ParametrosService } from '../parametros/_services/parametros.service';
import { Huesped } from 'src/app/models/huesped.model';
import { HuespedService } from 'src/app/services/huesped.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };

  allReservations:Huesped[]

  @ViewChild('modal') private modalComponent: ModalComponent;
  

  constructor(
    private _parametrosService: ParametrosService,
    private _huespedService: HuespedService
  ) {}

  async ngOnInit() {
    this._parametrosService.getParametros().subscribe({
      next:(item)=>{
        console.log(item);
      }
    });
    this.allReservations = await firstValueFrom(this._huespedService.getAll());
  }

  async openModal() {
    return await this.modalComponent.open();
  }
}
