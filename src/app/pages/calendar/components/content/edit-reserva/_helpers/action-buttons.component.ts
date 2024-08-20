import { Component, EventEmitter, Input, Output } from '@angular/core';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { AlertsMessageInterface } from 'src/app/models/message.model';

@Component({
  selector: 'app-reservation-actions',
  template: `
    <div class="h4 modal-content" style="background-color: #00506a; text-align: center; padding: 5px 0;">
      <label style="color: aliceblue"> Estado de Reserva / Folio </label>
      <div class="form-group row">
        <div class="form-group col-lg-6" *ngIf="isReservable">
          <button 
            [disabled]="currentHuesped.estatus !== 'Reserva Sin Pago'"
            class="btn btn-primary btn-block"
            type="submit"
            style="width: 100%;"
            (click)="confirmaReserva(3, currentHuesped.folio); closeModal()"
          >
            Confirma Reserva
          </button>
          <br>
        </div>
        <div class="form-group col-lg-6" *ngIf="isReservable">
          <button
            [disabled]="todaysDateComparer()"
            class="btn btn-success btn-block"
            type="submit"
            style="width: 100%;"
            (click)="confirmaReserva(1, currentHuesped.folio); closeModal()"
          >
            Realiza Check-In
          </button>
        </div>
        <div class="form-group col-lg-6" *ngIf="isReservable || isHuespedEnCasa">
          <button 
            (click)="setStep(2)"
            class="btn btn-warning btn-block" 
            type="submit"
            style="width: 100%;"
          >
            Realiza un Pago
          </button>
          <br>
        </div>
        <div class="form-group col-lg-6" *ngIf="isReservable">
          <button
            [disabled]="!canSendConfirmation"
            class="btn btn-secondary btn-block"
            type="submit"
            style="width: 100%;"
            (click)="openEnviarConfirmacion()"
          >
            Enviar Confirmacion
          </button>
        </div>
        <div class="form-group col-lg-6" *ngIf="isReservable">
          <button
            class="btn btn-danger btn-block"
            type="submit"
            style="width: 100%;"
            (click)="confirmaReserva(11,currentHuesped.folio);"
          >
            No se presento
          </button>
          <br>
        </div>
        <div class="form-group col-lg-6" *ngIf="isReservable">
          <button
            class="btn btn-danger btn-block"
            type="submit"
            style="width: 100%;"
            (click)="confirmaReserva(12,currentHuesped.folio);"
          >
            Cancela Reserva
          </button>
          <br>
        </div>
        <div class="form-group col-lg-6" *ngIf="isReservable || isHuespedEnCasa">
          <button
            (click)="openModifica()"
            class="btn btn-primary btn-block"
            type="submit"
            style="width: 100%;"
          >
            Modifica Reserva
          </button>
          <br>
        </div>
        <div class="form-group col-lg-6" *ngIf="isHuespedEnCasa">
          <button
            class="btn btn-danger btn-block"
            type="submit"
            style="width: 100%;"
          >
            Realiza Check-Out
          </button>
          <br>
        </div>
        <div class="form-group col-lg-12" *ngIf="isReservaCancelada">
          <button
            class="btn btn-success btn-block"
            type="submit"
            style="width: 100%;"
          >
            Reactivar Reservación
          </button>
          <br>
        </div>
      </div>
    </div>
  `,
})
export class ReservationActionsComponent {
    @Input() currentHuesped: Huesped;
    @Input() currentEdoCuenta: edoCuenta[];
    @Input() estatus: string;

  @Output() loadingEvent = new EventEmitter<boolean>();
  @Output() honAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();
  @Output() honSetStep: EventEmitter<number> = new EventEmitter();
  @Output() honEstatusUpdate: EventEmitter<number> = new EventEmitter();
  @Output() honModificaReserva: EventEmitter<any> = new EventEmitter();

  get isReservable() {
    return ['Reserva Confirmada', 'Reserva Sin Pago', 'Reserva Temporal', 'Esperando Deposito', 'Deposito Realizado', 'Totalmente Pagada'].includes(this.estatus);
  }

  get isHuespedEnCasa() {
    return this.estatus === 'Huesped en Casa';
  }

  get isReservaCancelada() {
    return this.estatus === 'Reserva Cancelada';
  }

  get canSendConfirmation() {
    return ['Reserva Sin Pago', 'Deposito Realizado', 'Esperando Deposito', 'Totalmente Pagada', 'Reserva Confirmada'].includes(this.estatus);
  }

  confirmaReserva(estatus:number,folio:string){
    this.loadingEvent.emit(true);

    if ([12, 11, 4].includes(estatus)) {
      const edoFiltrado = this.currentEdoCuenta.filter(result => result.Abono! > 1);
      console.log(edoFiltrado);
    
      if (edoFiltrado.length > 0) {
        const totalCargos = edoFiltrado.reduce((sum, item) => sum + item.Cargo!, 0);
        const totalAbonos = edoFiltrado.reduce((sum, item) => sum + item.Abono!, 0);
    
        if (totalAbonos < totalCargos) {
          this.honAlertMessage.emit({
            tittle: 'Advertencia',
            message: 'El huesped tiene saldo a Favor, aplique una devolución antes de darle Check-Out'
          });
          this.loadingEvent.emit(false);
          return;
        }
      }
      this.loadingEvent.emit(false);
    }
    this.honEstatusUpdate.emit(estatus);
  }

  closeModal() {
    // Implement this method
  }

  setStep(step: number) {
    this.honSetStep.emit(step);
  }

  openEnviarConfirmacion() {
    // Implement this method
  }

  openModifica() {
    this.honModificaReserva.emit();
  }

  todaysDateComparer() {
    // Implement this method
  }
}
