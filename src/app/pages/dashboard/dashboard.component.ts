import { Component,  OnInit,  ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { ParametrosService } from '../parametros/_services/parametros.service';
import { Huesped } from 'src/app/models/huesped.model';
import { HuespedService } from 'src/app/services/huesped.service';
import { firstValueFrom, Subject } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';

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
  roomCodesComplete:Habitacion[]
  changingValue: Subject<any> = new Subject();
  changingValueRooms: Subject<any> = new Subject();

  @ViewChild('modal') private modalComponent: ModalComponent;
  

  constructor(
    private _huespedService: HuespedService,
    private _roomService: HabitacionesService,
  ) {}

  async ngOnInit() {
    this._huespedService.updateReservations$.subscribe({
      next:async (value)=>{
        if(value){
          await this.getReservations();
        }
      }
    })
    await this.getReservations();
    await this.checkRoomCodesIndexDB();
  }

  async openModal() {
    return await this.modalComponent.open();
  }

  getReservations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._huespedService.getAll().subscribe({
        next: (value) => {
          this.allReservations = [...value];
          this.changingValue.next(value);

          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async checkRoomCodesIndexDB(refresh: boolean = false) {
    const roomsCodesIndexDB: Habitacion[] = await this._roomService.readIndexDB("Rooms");
    /** Check if RoomsCode are on IndexDb */
    if (roomsCodesIndexDB) {
      this.roomCodesComplete = [...roomsCodesIndexDB];
    } else {
      this.roomCodesComplete = await firstValueFrom(this._roomService.getAll());
    }
    this.changingValueRooms.next(this.roomCodesComplete);
  }
}
