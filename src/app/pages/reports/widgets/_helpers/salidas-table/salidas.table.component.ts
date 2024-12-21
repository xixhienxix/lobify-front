/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Codigos } from 'src/app/models/codigos.model';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';

export interface Reservation {
  reserva: number;
  huesped: string;
  acciones: string;
}

const ELEMENT_DATA: Reservation[] = [
  { reserva: 1, huesped: 'John Doe', acciones: '' },
  { reserva: 2, huesped: 'Jane Smith', acciones: '' },
  { reserva: 3, huesped: 'Michael Johnson', acciones: '' }
];

@Component({
  selector: 'app-salidas-table',
  templateUrl: './salidas.table.component.html',
  styleUrls: ['./salidas.table.component.scss']
})
export class SalidasTableComponent implements OnInit {
  displayedColumns: string[] = ['reserva', 'huesped', 'acciones'];

  @Input() dataSource: Huesped[] = [];
  @Input() houseKeepingCodes: HouseKeeping[] = [];
  @Input() codigosCargo: Codigos[] = [];
  @Input() estatusArray: Estatus[] = [];
  @Input() ratesArrayComplete: Tarifas[] = [];
  @Input() roomCodesComplete: any[] = [];
  @Input() parametrosModel: Parametros;

  @Output() onAgregarPago: EventEmitter<edoCuenta> = new EventEmitter();
  @Output() onOpenEnviarReservacion: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetAdicionales: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetPromesas: EventEmitter<string> = new EventEmitter();
  @Output() onUpdateEstatusHuesped: EventEmitter<Huesped> = new EventEmitter();
  @Output() onGuardarPromesa: EventEmitter<any> = new EventEmitter();
  @Output() onChangeAmaStatus: EventEmitter<any> = new EventEmitter();
  @Output() onEstatusChange: EventEmitter<any> = new EventEmitter();
  @Output() onEstatusAplicado: EventEmitter<Huesped> = new EventEmitter();
  @Output() honUpdateHuesped: EventEmitter<any> = new EventEmitter();
  @Output() onFetchReservations: EventEmitter<Huesped> = new EventEmitter();
  @Output() onActualizarCuenta: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  formatISODateToCustom(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('es-MX', { month: 'short' }).toLocaleUpperCase();
    const year = date.getFullYear();
  
    return `${day} ${month} ${year}`;
  }

  onButtonClick(event: Event): void {
    event.stopPropagation(); // Prevents the click event from propagating to the panel header
    // Additional button click logic here
  }
}