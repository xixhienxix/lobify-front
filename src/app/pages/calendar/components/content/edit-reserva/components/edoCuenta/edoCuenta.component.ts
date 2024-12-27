import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { Tarifas } from 'src/app/models/tarifas';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { HuespedService } from 'src/app/services/huesped.service';
import { TarifasService } from 'src/app/services/tarifas.service';
import { DateTime } from 'luxon';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';


@Component({
  selector: 'app-edo-cuenta-component',
  templateUrl: './edoCuenta.component.html',
  styleUrls: ['./edoCuenta.component.scss']
})
export class EdoCuentaComponent implements OnInit, OnDestroy, OnChanges {
  totalCargos = 0;
  totalDescuentos = 0;
  totalAbonos = 0;
  subTotalServiciosExtra = 0;
  iva = 0;
  estadoDeCuenta: any[] = [];
  edoCuentaActivos: any[] = [];
  edoCuentaCancelados: any[] = [];
  edoCuentaDevoluciones: any[] = [];
  alojamientoPorNoche: any[] = [];
  edoCuentaAlojamientosActivos: any[] = [];
  edoCuentaServiciosExtra: any[] = [];
  edoCuentaDescuentosLista: any[] = [];
  edoCuentaAbonosLista: any[] = [];
  totalCalculado = 0;
  totalimpuestos = 0;
  impuestoSobreHospedaje = 0;
  subTotalAlojamiento:number = 0;
  subtotalAlojamientoSinISH:number = 0;
  subscription: any[] = [];
  tarifaDelDia:any[]=[]

  @Input() currentHuesped:Huesped
  @Input() currentEdoCuenta:edoCuenta[]=[]
  @Input() standardRatesArray:Tarifas[]=[]
  @Input() tempRatesArray:Tarifas[]=[]
  @Input() ratesArrayComplete:Tarifas[]=[]
  

  @Output() honAlertMessage:EventEmitter<AlertsMessageInterface> = new EventEmitter();

  constructor(
    public _huespedService: HuespedService,
    public _edoCuentaService: Edo_Cuenta_Service,
    public modalService: NgbModal,
    public i18n: NgbDatepickerI18n,
    public divisasService: DivisasService,
    private _tarifasService: TarifasService,
    private _parametrosService: ParametrosService,
    private _dbCheckingService: IndexDBCheckingService
    
  ) {
    const sb = this._edoCuentaService.getNotification().subscribe(data => {
      if (data) {
        this.getEdoCuenta();
      }
    });
    this.subscription.push(sb);
  }

  ngOnInit(): void {
    this.getEdoCuenta();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.currentEdoCuenta){
      this.getEdoCuenta();
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sb => sb.unsubscribe());
  }

  getEdoCuenta() {
    // Reset variables
    this.resetTotals();

    // Extract guest arrival date
    const [diaLlegada, mesLlegada, anoLlegada] = this.currentHuesped.llegada.split("/").map(Number);
    const fromDate = DateTime.fromISO(this.currentHuesped.llegada).toJSDate();

    // Process each item
    this.currentEdoCuenta.forEach((item) => {
      this.estadoDeCuenta.push(item);
      switch (item.Estatus) {
        case 'Activo':
          this.edoCuentaActivos.push(item);
          this.processActiveItem(item, fromDate);
          break;
        case 'Cancelado':
          this.edoCuentaCancelados.push(item);
          break;
        case 'Devolucion':
          this.edoCuentaDevoluciones.push(item);
          break;
      }

      // Update totals
      this.updateTotals(item);
    });

    // Calculate totals
    this.calculateTotals();
  }

  private resetTotals() {
    this.totalCargos = 0;
    this.totalDescuentos = 0;
    this.totalAbonos = 0;
    this.subTotalServiciosExtra = 0;
    this.iva = 0;
    this.estadoDeCuenta = [];
    this.edoCuentaActivos = [];
    this.edoCuentaCancelados = [];
    this.edoCuentaDevoluciones = [];
    this.alojamientoPorNoche = [];
    this.edoCuentaAlojamientosActivos = [];
    this.edoCuentaServiciosExtra = [];
    this.edoCuentaDescuentosLista = [];
    this.edoCuentaAbonosLista = [];
  }

  private processActiveItem(item: any, fromDate: Date) {
    if (item.Descripcion === 'HOSPEDAJE') {
      this.processHospedaje(item, fromDate);
    } else if (item.Cargo !== 0) {
      this.processServiciosExtra(item);
    }

    if (item.Forma_de_Pago === 'Descuento') {
      this.processDescuento(item);
    }

    if (item.Abono !== 0 && item.Forma_de_Pago !== 'Descuento') {
      this.processAbono(item);
    }
  }

  private async processHospedaje(item: any, fromDate: Date) {

    if (!this.ratesArrayComplete || this.ratesArrayComplete.length === 0) {
      await this._dbCheckingService.checkIndexedDB(['tarifas'], true);
      this.ratesArrayComplete = await this._dbCheckingService.loadTarifas(true);
  }

    const tarifa = this.ratesArrayComplete.find(item => 
      item.Tarifa === this.currentHuesped.tarifa &&
      item.Habitacion.some(room => room.trim().toLowerCase() === this.currentHuesped.habitacion.toLowerCase())
    )!;
    //   this.tarifaDelDia = this._tarifasService.ratesTotalCalc(tarifa,this.standardRatesArray,this.tempRatesArray,this.currentHuesped.habitacion,this.currentHuesped.adultos,this.currentHuesped.ninos,new Date(this.currentHuesped.llegada),new Date(this.currentHuesped.salida));


    //   this.impuestoSobreHospedaje = item.Total! * this._parametrosService.getCurrentParametrosValue.ish / 100;

    //   this.subTotalAlojamiento = item.Cargo!.toLocaleString();

    //   fromDate.setDate(fromDate.getDate() + 1);
    // }
    const dailyRates = this._tarifasService.ratesTotalCalc(
      tarifa,
      this.standardRatesArray,
      this.tempRatesArray,
      tarifa.Habitacion[0], // Assuming single room per rate
      this.currentHuesped.adultos,
      this.currentHuesped.ninos,
      new Date(this.currentHuesped.llegada),
      new Date(this.currentHuesped.salida)
    );
  
    this.tarifaDelDia = dailyRates;
    this.impuestoSobreHospedaje = item.Total! * this._parametrosService.getCurrentParametrosValue.ish / 100;
    this.subTotalAlojamiento = item.Cargo!.toLocaleString();
    this.subtotalAlojamientoSinISH = item.Total - this.impuestoSobreHospedaje
  }

  private processServiciosExtra(item: any) {
    const fechaLarga = this.parseDate(this.currentHuesped.llegada);
    const fullFechaServicio = this.formatDate(fechaLarga);
    const edoCuentaserviciosExtraTemp = { ...item, Fecha: fullFechaServicio };

    this.edoCuentaServiciosExtra.push(edoCuentaserviciosExtraTemp);
    this.subTotalServiciosExtra += item.Cargo!;
  }

  private processDescuento(item: any) {
    const fechaLargaDesc = this.parseDate(this.currentHuesped.llegada);
    const fullFechaDescuento = this.formatDate(fechaLargaDesc);
    const edoCuentaDescuentos = { ...item, Fecha: fullFechaDescuento };

    this.edoCuentaDescuentosLista.push(edoCuentaDescuentos);
  }

  private processAbono(item: any) {
    const fechaLargaAbonos = this.parseDate(this.currentHuesped.llegada);
    const fullFechaAbonos = this.formatDate(fechaLargaAbonos);
    const edoCuentaAbonos = { ...item, Fecha: fullFechaAbonos };

    this.edoCuentaAbonosLista.push(edoCuentaAbonos);
  }

  private updateTotals(item: any) {
    if (item.Cargo !== 0 && item.Estatus === 'Activo') {
      this.totalCargos += item.Cargo!;
    }
    if (item.Forma_de_Pago === 'Descuento' && item.Estatus === 'Activo') {
      this.totalDescuentos += item.Abono!;
    }
    if (item.Abono !== 0 && item.Estatus === 'Activo' && item.Forma_de_Pago !== 'Descuento') {
      this.totalAbonos += item.Abono!;
    }
  }

  private calculateTotals() {
    this.totalCalculado = this.totalCargos - this.totalAbonos;
    const subtotal = this.subTotalServiciosExtra
    this.iva = (subtotal === 0) ? 0 : (subtotal * this._parametrosService.getCurrentParametrosValue.iva) / 100;
    // if(subtotal === 0){
    //   this.iva = 0
    // }
    // this.iva = ((subtotal === 0 ? 1 : subtotal) * this._parametrosService.getCurrentParametrosValue.iva) / 100;
    this.totalimpuestos = this.iva + this.impuestoSobreHospedaje;
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDate(date: Date): string {
    return `${date.getUTCDate()} de ${this.i18n.getMonthFullName(date.getUTCMonth() + 1)} del ${date.getFullYear()}`;
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
