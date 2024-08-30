import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { EditReservaComponent } from 'src/app/pages/calendar/components/content/edit-reserva/edit-reserva.component';

import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Codigos } from 'src/app/models/codigos.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';

@Injectable({
  providedIn: 'root',
})
export class EditReservasModalService {
    constructor(private modalService: NgbModal) {}

    private outputSubject = new Subject<any>();

    // Open the EditReservaComponent modal and return a reference
    openEditReservaModal(
                        currentHuesped:Huesped,
                        codigosCargo: Codigos[], 
                        data:any, 
                        houseKeepingCodes:HouseKeeping[],
                        habitacion:Habitacion,
                        estatusArray:Estatus[],
                        colorAma:any,
                        ratesArrayComplete:Tarifas[],
                        roomCodesComplete:Habitacion[],
                        checkIn:string,
                        checkOut:string,
                        zona:string,
                        estadoDeCuenta:edoCuenta[],
                        promesasDisplay:boolean=true,
                    ): NgbModalRef {
      const modalRef = this.modalService.open(EditReservaComponent, {
        size: 'md',
        backdrop: 'static',
      });
  
      // Pass input data to the modal component
      modalRef.componentInstance.currentHuesped = currentHuesped
      modalRef.componentInstance.codigosCargo = codigosCargo
      modalRef.componentInstance.data = data
      modalRef.componentInstance.houseKeepingCodes = houseKeepingCodes
      modalRef.componentInstance.currentRoom = habitacion
      modalRef.componentInstance.promesasDisplay = promesasDisplay
      modalRef.componentInstance.estatusArray = estatusArray
      modalRef.componentInstance.colorAmaLlaves = colorAma
      modalRef.componentInstance.ratesArrayComplete = ratesArrayComplete
      modalRef.componentInstance.roomCodesComplete = roomCodesComplete
      modalRef.componentInstance.checkIn = checkIn
      modalRef.componentInstance.checkOut = checkOut
      modalRef.componentInstance.zona = zona
      modalRef.componentInstance.estadoDeCuenta = estadoDeCuenta

      // Subscribe to modal outputs and emit them to outputSubject
      this.subscribeToModalOutputs(modalRef);

      return modalRef;
    }
  
    // Subscribe to modal outputs using a Subject
    subscribeToModalOutputs(modalRef: NgbModalRef){
  
      modalRef.componentInstance.onAgregarPago.subscribe({
        next: (data: any) => {
            this.outputSubject.next({ type: 'onAgregarPago', data });
        },
        error: (error: any) => {
            this.outputSubject.error({ type: 'onAgregarPago', error });
        }
      });
  
      modalRef.componentInstance.onEditRsv.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onEditRsv', data });
      });

      modalRef.componentInstance.onOpenEnviarReservacion.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onOpenEnviarReservacion', data });
      });

      modalRef.componentInstance.onGetAdicionales.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onGetAdicionales', data });
      });

      modalRef.componentInstance.onGetPromesas.subscribe({
        next: (data: any) => {
            this.outputSubject.next({ type: 'onGetPromesas', data });
        },
        error: (error: any) => {
            this.outputSubject.error({ type: 'onGetPromesas', error });
        }
      });

      modalRef.componentInstance.onUpdateEstatusHuesped.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onUpdateEstatusHuesped', data });
      });

      modalRef.componentInstance.onAlertMessage.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onAlertMessage', data });
      });

      modalRef.componentInstance.onGuardarPromesa.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onGuardarPromesa', data });
      });

      modalRef.componentInstance.onChangeAmaStatus.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onChangeAmaStatus', data });
      });

      modalRef.componentInstance.onEstatusChange.subscribe((data: any) => {
        this.outputSubject.next({ type: 'onEstatusChange', data });
      });

      modalRef.componentInstance.onEstatusAplicado.subscribe({
        next: (data: any) => {
            this.outputSubject.next({ type: 'onEstatusAplicado', data });
        },
        error: (error: any) => {
            this.outputSubject.error({ type: 'onEstatusAplicado', error });
        }
      });

      modalRef.componentInstance.honUpdateHuesped.subscribe((data: any) => {
        this.outputSubject.next({ type: 'honUpdateHuesped', data });
      });

      modalRef.componentInstance.onFetchReservations.subscribe({
        next: (data: any) => {
            this.outputSubject.next({ type: 'onFetchReservations', data });
        },
        error: (error: any) => {
            this.outputSubject.error({ type: 'onFetchReservations', error });
        }
      });

      modalRef.componentInstance.onActualizarCuenta.subscribe({
        next: (data: any) => {
            this.outputSubject.next({ type: 'onActualizarCuenta', data });
        },
        error: (error: any) => {
            this.outputSubject.error({ type: 'onActualizarCuenta', error });
        }
      });
      // Subscribe to other outputs similarly...
    }

    getModalOutputs(): Observable<any> {
        return this.outputSubject.asObservable();
    }

  }
