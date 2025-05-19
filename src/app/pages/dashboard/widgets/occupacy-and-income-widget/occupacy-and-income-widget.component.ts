import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { TarifasService } from 'src/app/services/tarifas.service';

@Component({
  selector: 'app-occupacy-and-income-widget',
  templateUrl: './occupacy-and-income-widget.component.html',
  styleUrls: ['./occupacy-and-income-widget.component.scss']
})
export class OccupacyAndIncomeWidgetComponent implements OnInit, OnChanges{
  porcentajeOcupaccion:Huesped[]=[];
  inventario:Habitacion[]=[];
  adr: number = 0;
  revPar:number = 0;
  adrTooltip:string=""
  revParTooltip:string=''
  huespedEnCasa: Huesped[] = [];
  disponibles: Huesped[] = [];
  porLlegar:Huesped[]=[];
  
  @Input() allAccounts: edoCuenta[];
  @Input() allReservations: Huesped[];
  @Input() changing: Subject<Huesped[]>;
  @Input() changingValueRooms: Subject<Habitacion[]>;
  @Input() totalIncome: any;
  @Input() standardRatesArray: Tarifas[]=[];
  @Input() tempRatesArray: Tarifas[]=[];
  @Input() ratesArrayComplete: Tarifas[]=[];
  @Input() totalRooms: number = 0;
  @Input() roomCodesComplete: Habitacion[] = [];


  constructor(private cdr: ChangeDetectorRef,
    private _tarifasService: TarifasService
  ){
  }

  ngOnInit(): void {
    this.changing.subscribe({
      next:async (dataSource)=>{
        this.allReservations = [...dataSource];
        this.processReservations();
        this.processDashboard();
        this.cdr.detectChanges(); // Manually trigger change detection if needed

      }
    })
    this.changingValueRooms.subscribe({
      next:(roomSource)=>{
        this.inventario = [...roomSource]
        this.cdr.detectChanges(); // Manually trigger change detection if needed
      }
    });

    if (this.allReservations && this.allReservations.length > 0) {
      this.processDashboard();
    }
  }

  processDashboard(){
    this.avaibleRooms();
    this.calculateADR();
    this.calculateRevPAR();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allReservations'] && this.allReservations) {
      this.processDashboard();
    }
  }

  getTotalIncomeForToday(): number {
    const todayDate = new Date();
    const data = this.allAccounts;
    todayDate.setHours(0, 0, 0, 0); // Reset time to the start of the day

    // Filter for today’s date
    const todayData = data.filter(item => {
        const itemDate = new Date(item.Fecha);
        itemDate.setHours(0, 0, 0, 0); // Reset time to the start of the day
        return itemDate.getTime() === todayDate.getTime();
    });

    // Calculate total income from 'Cargo' properties
    const totalIncome = todayData.reduce((total, item) => {
        return total + (item.Abono ?? 0);
    }, 0);

    return totalIncome;
}

  occupancyPercentage(){
      // Count rooms that are occupied
      const habitacionesOcupadas = this.allReservations.filter(huesped => huesped.estatus === '1').length;
    
      // Count total available rooms
      const habitacionesTotales = this.roomCodesComplete.length;
    
      // Calculate percentage of occupancy
      const porcentajeOcupacion = (habitacionesOcupadas / habitacionesTotales) * 100;
    
      return porcentajeOcupacion;
    
    // return Math.ceil((this.porcentajeOcupaccion.length / this.inventario.length) * 100)
  }

  processReservations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.allReservations.forEach(item => {
      const llegada = new Date(item.salida);
      llegada.setHours(0, 0, 0, 0);

      if (llegada.getTime() === today.getTime()) {
        if(item.estatus === 'Deposito Realizado'){
          this.porcentajeOcupaccion.push(item);
        }
      }else if(item.estatus === 'Huesped en Casa'){
        this.porcentajeOcupaccion.push(item);
      }
    });
  }

  calculateADR(): void {
    if (!this.allReservations || this.allReservations.length === 0) {
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today); // Creamos una copia de la fecha actual
    tomorrow.setDate(today.getDate() + 1); // Ajustamos la fecha al día siguiente

    const todayStart = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)); // End of today

    const reservacionesDelDia = this.allReservations.filter(guest => {
      const llegada = new Date(guest.llegada);
      const salida = new Date(guest.salida);

      // Check if today is within the guest's arrival and departure range
      return (guest.estatus === 'Huesped en Casa' || guest.estatus === 'Reserva Sin Pago' || guest.estatus === 'Deposito Realizado') &&
            ((llegada <= todayEnd && salida >= todayStart));
    });



    this.adr = reservacionesDelDia.reduce((total, item) => {
      const tarifa = this.ratesArrayComplete.find(tarifa => tarifa.Tarifa === item.tarifa.Tarifa);

      if (tarifa) {
        const totalDelDia = this._tarifasService.ratesTotalCalc(
          tarifa,
          this.standardRatesArray,
          this.tempRatesArray,
          item.habitacion,
          item.adultos,
          item.ninos,
          today,
          tomorrow,
          1
        );

        const checkTotalDelDia = Array.isArray(totalDelDia) ? totalDelDia[0]?.tarifaTotal ?? 0 : totalDelDia ?? 0;

        if (checkTotalDelDia) {
          return total + checkTotalDelDia;
        }
      }

      return total;
    }, 0);
  }

  calculateRevPAR(): void {
    // Check if necessary inputs are available
    if (!this.allReservations || this.allReservations.length === 0 || !this.roomCodesComplete) {
      this.revPar = 0;
      return;
    }
  
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    const todayStart = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)); // End of today
  
    // Filter reservations that are relevant for calculating RevPAR
    const reservacionesDelDia = this.allReservations.filter(guest => {
      const llegada = new Date(guest.llegada);
      const salida = new Date(guest.salida);
  
      // Check if today is within the guest's arrival and departure range
      return (guest.estatus === 'Huesped en Casa' || guest.estatus === 'Reserva Sin Pago' || guest.estatus === 'Deposito Realizado') &&
        (llegada <= todayEnd && salida >= todayStart);
    });
  
  
    // Calculate total revenue from the filtered reservations
    const totalRevenue = reservacionesDelDia.reduce((total, item) => {
      const tarifa = this.ratesArrayComplete.find(tarifa => tarifa.Tarifa === item.tarifa.Tarifa);
  
      if (tarifa) {
        const totalDelDia = this._tarifasService.ratesTotalCalc(
          tarifa,
          this.standardRatesArray,
          this.tempRatesArray,
          item.habitacion,
          item.adultos,
          item.ninos,
          today,
          tomorrow,
          1
        );

        const checkTotalDelDia = Array.isArray(totalDelDia) ? totalDelDia[0]?.tarifaTotal ?? 0 : totalDelDia ?? 0;
  
        if (checkTotalDelDia) {
          return total + checkTotalDelDia;
        }
      }

      return total;
    }, 0);
  
    // Calculate RevPAR
    const totalRooms = this.roomCodesComplete?.length || 0; // Use optional chaining and default to 0 if undefined
    const availableRooms = Math.max(0, this.roomCodesComplete.length - (this.huespedEnCasa.length + this.porLlegar.length));
    ; // Adjust if you have logic to determine actual available rooms
  
    // Prevent division by zero
    if (availableRooms > 0) {
      this.revPar = totalRevenue / availableRooms;
    } else {
      this.revPar = 0;
    }
  }
  

  checkAvaibility() {
    // Ensure inputs are defined and initialized
    if (!this.allReservations || !this.roomCodesComplete) {
        return 0; // Return 0 or a default value if inputs are not yet available
    }

    const hoy = new Date();
    
    // Filtrar reservaciones activas para hoy
    const reservacionesHoy = this.allReservations.filter(reservacion => {
        const fechaLlegada = new Date(reservacion.llegada);
        const fechaSalida = new Date(reservacion.salida);
    
        // Reservación válida si llegada es antes o igual a hoy y salida es después de hoy
        return fechaLlegada <= hoy && fechaSalida > hoy;
    });

    // Número de habitaciones ocupadas hoy
    const habitacionesOcupadas = reservacionesHoy.length;

    // Calcular porcentaje de ocupación
    const totalHabitaciones = this.roomCodesComplete.length;
    const porcentajeOcupacion = totalHabitaciones > 0 ? (habitacionesOcupadas / totalHabitaciones) * 100 : 0;

    return Math.ceil(porcentajeOcupacion);
}

    avaibleRooms(){
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.huespedEnCasa = [];
        this.inventario = [];
        this.disponibles = [];

        this.allReservations.forEach(item => {
          const llegada = new Date(item.llegada);
          llegada.setHours(0, 0, 0, 0);

            if (reservationStatusMap[1].includes(item.estatus)) {
              this.huespedEnCasa.push(item);
            } 
            if (llegada.getTime() === today.getTime()) {
              if (reservationStatusMap[2].includes(item.estatus)) {
                this.porLlegar.push(item);
            }          
            }
        });
  }
}