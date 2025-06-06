/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, firstValueFrom } from 'rxjs';
import { Codigos } from 'src/app/models/codigos.model';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import { EditReservasModalService } from 'src/app/services/_shared/edit.rsv.open.modal';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';

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

  constructor( private _checkIndexDBInitialValues: IndexDBCheckingService,
              private _edoCuentaService:Edo_Cuenta_Service,
              private _editReservasModal: EditReservasModalService,

  ) {}

  ngOnInit() {

    combineLatest([
      this._checkIndexDBInitialValues.estatus$,
      this._checkIndexDBInitialValues.codigos$,
      this._checkIndexDBInitialValues.tarifas$,
      this._checkIndexDBInitialValues.habitaciones$,
      this._checkIndexDBInitialValues.parametros$,
      this._checkIndexDBInitialValues.houseKeepingCodes$
    ]).subscribe(([estatus, codigos, tarifas, habitaciones, parametros, ama]) => {
      this.estatusArray = estatus ?? [];  // Handle 'estatus'
      this.codigosCargo = codigos ?? [];  // Handle 'codigos'
      this.ratesArrayComplete = tarifas ?? [];  // Handle 'tarifas'
      this.roomCodesComplete = habitaciones ?? [];  // Handle 'habitaciones'
      this.parametrosModel = parametros;  // Handle 'parametros'
      this.houseKeepingCodes = ama ?? [];  // Handle 'houseKeepingCodes'
    });
  }

  formatISODateToCustom(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('es-MX', { month: 'short' }).toLocaleUpperCase();
    const year = date.getFullYear();
  
    return `${day} ${month} ${year}`;
  }

  async onButtonClick(event: Event,reserva:Huesped): Promise<void> {
    event.stopPropagation(); // Prevents the click event from propagating to the panel header

    if (!this.houseKeepingCodes || this.houseKeepingCodes.length === 0) {
      await this._checkIndexDBInitialValues.checkIndexedDB(['housekeeping'], true);
      this.houseKeepingCodes = await this._checkIndexDBInitialValues.loadHouseKeepingCodes(true);
    }
    let colorAma = this.houseKeepingCodes.find(item =>
      item.Descripcion == reserva.estatus_Ama_De_Llaves!.toUpperCase()
    )?.Color!

    if (!this.roomCodesComplete || this.roomCodesComplete.length === 0) {
      await this._checkIndexDBInitialValues.checkIndexedDB(['habitaciones'], true);
      this.ratesArrayComplete = await this._checkIndexDBInitialValues.loadTarifas(true);
    }

    if(!this.estatusArray || this.estatusArray.length === 0){
      await this._checkIndexDBInitialValues.checkIndexedDB(['estatus'], true);
      this.estatusArray = await this._checkIndexDBInitialValues.loadEstatus(true);
    }

    const estadoDeCuenta = await this.checkEdoCuentaClient(reserva.folio);

    const habitacion = this.roomCodesComplete.find(item=>item.Numero === reserva.numeroCuarto)
    
    const modalRef = this._editReservasModal.openEditReservaModal(  
          reserva,
          this.codigosCargo,
          reserva,
          this.houseKeepingCodes,
          habitacion!,
          this.estatusArray,
          colorAma,
          this.ratesArrayComplete,
          this.roomCodesComplete,
          this.parametrosModel.checkIn,
          this.parametrosModel.checkOut,
          this.parametrosModel.zona,
          estadoDeCuenta,
          false
    )
  }

  async checkEdoCuentaClient(folio:string){
    return await firstValueFrom(this._edoCuentaService.getCuentas(folio));
  }
}