import { Component,  OnInit,  ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import { ParametrosService } from '../parametros/_services/parametros.service';
import { Huesped } from 'src/app/models/huesped.model';
import { HuespedService } from 'src/app/services/huesped.service';
import { firstValueFrom, Subject } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { Parametros } from '../parametros/_models/parametros';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';

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
  parametrosModel:Parametros;
  cuentasArray:any;

  @ViewChild('modal') private modalComponent: ModalComponent;
  

  constructor(
    private _huespedService: HuespedService,
    private _roomService: HabitacionesService,
    private _parametrosService: ParametrosService,
    private _edoCuentaService: Edo_Cuenta_Service
  ) {}

  async ngOnInit() {
    await this.checkParametrosIndexDB();

    this._huespedService.updateReservations$.subscribe({
      next:async (value)=>{
        if(value){
          await this.getReservations();
        }
      }
    })
    await this.getReservations();
    await this.checkRoomCodesIndexDB();
    await this.getCuentas();
    this.reviewCheckOuts();
    this.reviewNoShow();
  }

  async getCuentas(){
    this._edoCuentaService.getTodasLasCuentas().subscribe({
      next:(value)=>{
        const todayDate = new Date();
        const saldoDelDia = value.filter(item => {
            // Create a new Date object for the item and normalize it
            const itemDate = new Date(item.Fecha);
            itemDate.setHours(0, 0, 0, 0);
        
            // Compare normalized dates
            return itemDate.getTime() === todayDate.getTime() && item.Abono !== 0 && item.Cargo === 0;
          });
          console.log(saldoDelDia)
      },
      error:()=>{
      }
  })
}

  async reviewNoShow() {
    const today = new Date();
  
    if (this.parametrosModel.noShowAutoUpdated) {
      const reservationsToUpdate = this.allReservations
        .filter(reservation => {
          const salidaDate = new Date(reservation.llegada); // Convert 'salida' to a Date object
          return salidaDate <= today && reservation.estatus === 'Reserva Sin Pago';
        })
        .map(reservation => {
          reservation.estatus = 'No Show';
          return reservation;
        });
  
      if (reservationsToUpdate.length > 0) {
        try {
          const updatePromises = reservationsToUpdate.map(reservation =>
            firstValueFrom(this._huespedService.updateEstatusHuesped(reservation))
          );
  
          const results = await Promise.all(updatePromises);
          if (results.every(result => result)) {
            this.getReservations();
          }
        } catch (err) {
          console.error('Error updating reservations:', err);
        }
      }
    }
  }

  async reviewCheckOuts() {
    const today = new Date();
  
    if (this.parametrosModel.autoCheckOut) {
      const reservationsToUpdate = this.allReservations
        .filter(reservation => {
          const salidaDate = new Date(reservation.salida); // Convert 'salida' to a Date object
          return salidaDate <= today && reservation.estatus === 'Huesped en Casa' && reservation.pendiente === 0;
        })
        .map(reservation => {
          reservation.estatus = 'Check-Out';
          return reservation;
        });
  
      if (reservationsToUpdate.length > 0) {
        try {
          const updatePromises = reservationsToUpdate.map(reservation =>
            firstValueFrom(this._huespedService.updateEstatusHuesped(reservation))
          );
  
          const results = await Promise.all(updatePromises);
          if (results.every(result => result)) {
            this.getReservations();
          }
        } catch (err) {
          console.error('Error updating reservations:', err);
        }
      }
    }
  }

  async openModal() {
    return await this.modalComponent.open();
  }

  async checkParametrosIndexDB() {
    // Attempt to read parameters from IndexDB
    const parametrosIndexDB: Parametros | null = await this._parametrosService.readIndexDB("Parametros");
  
    // Assign from IndexDB if available, otherwise fetch new parameters
    this.parametrosModel = parametrosIndexDB || await firstValueFrom(this._parametrosService.getParametros());
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
