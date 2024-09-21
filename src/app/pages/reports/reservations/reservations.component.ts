import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Huesped, reservationStatusMap } from "src/app/models/huesped.model";
import { IndexDBCheckingService } from "src/app/services/_shared/indexdb.checking.service";
import { Reservation } from "../widgets/_helpers/llegadas-table/llegadas.table.component";
import { MatPaginator } from "@angular/material/paginator";
import { Habitacion } from "src/app/models/habitaciones.model";
import { CommunicationService } from "../_services/event.services";

@Component({
    selector:'app-reservations-clients-reports',
    templateUrl:'./reservations.component.html',
    styleUrls:['./reservations.component.scss'],
    encapsulation:ViewEncapsulation.None
})
export class ReservationsReportsComponent implements OnInit {

      // Define color mappings
    colorDict = {
        0: '#99d284',
        1: '#fab3db',
        2: '#d0aaec',
        3: '#fac34e',
        4: '#DD4F5D',
        5: '#808080'
    };

    colorMap: Record<string, string> = {
        'Huesped en Casa': this.colorDict[0],
        'Reserva Sin Pago': this.colorDict[3],
        'Reserva Confirmada': this.colorDict[3],
        'Deposito Realizado': this.colorDict[3],
        'Esperando Deposito': this.colorDict[3],
        'Totalmente Pagada': this.colorDict[3],
        'Hizo Checkout': this.colorDict[4],
        'Uso Interno': this.colorDict[2],
        'Bloqueo': this.colorDict[3],
        'Reserva Temporal': this.colorDict[1],
        'No Show': this.colorDict[4],
        'Check-Out': this.colorDict[4],
        'Reserva Cancelada': this.colorDict[4],
        'Walk-In': this.colorDict[0],
        'Reserva en Casa': this.colorDict[0],
        'Reserva': this.colorDict[3],
        'default': this.colorDict[0]
    };

    filterText: string = '';          // For the text input filter
    specificDateValue: Date | null = null;  // For the specific date filter
    llegadaDateValue: Date | null = null;   // For the "Llegada" date filter
    salidaDateValue: Date | null = null;    // For the "Salida" date filter
    selectedStatus: string | null = null;   // For the status filter


    displayedColumns: string[] = ['nombre', 'telefono', 'email', 'llegada', 'salida', 'estatus', 'acciones'];
    prospectsArray: Huesped[] = [];
    filteredReservations = new MatTableDataSource<Huesped>(this.prospectsArray);
    statusOptions: string[] = reservationStatusMap[1].concat(reservationStatusMap[2]); // Assuming it returns an array of status strings
  
    @Input() allReservaciones: Huesped[] = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;



    constructor(private indexDbService: IndexDBCheckingService,
        private communicationService: CommunicationService
    ) {}
  
    ngOnInit(): void {
      this.indexDbService.reservaciones$.subscribe({
        next: (reservas) => {
          this.allReservaciones = reservas;
          this.prospectsArray = this.filterHuespedes(this.allReservaciones);
          this.filteredReservations.data = this.prospectsArray; // Set initial filtered data}      
          this.filteredReservations.paginator = this.paginator; // Set paginator

        }
      });
    }
  
    filterHuespedes(huespedes: Huesped[]): Huesped[] {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
  
      return huespedes.filter((huesped) => {
        const llegadaDate = new Date(huesped.llegada);
        const salidaDate = new Date(huesped.salida);
  
        const isThisMonth =
          (llegadaDate.getMonth() === currentMonth && llegadaDate.getFullYear() === currentYear) ||
          (salidaDate.getMonth() === currentMonth && salidaDate.getFullYear() === currentYear);
  
          const matchesEstatus = reservationStatusMap[1].includes(huesped.estatus) || reservationStatusMap[2].includes(huesped.estatus);
  
        return isThisMonth && matchesEstatus;
      });
    }

    verFolio(element:any){
        this.communicationService.emitEvent(element);
    }
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.filteredReservations.filter = filterValue;
    }
  
    applySpecificDateFilter(date: Date) {
      if (date) {
        this.filteredReservations.data = this.prospectsArray.filter((reservation) =>
          new Date(reservation.creada).toDateString() === new Date(date).toDateString()
        );
      } else {
        this.filteredReservations.data = this.prospectsArray;
      }
    }
  
    applyLlegadaDateFilter(date: Date) {
      if (date) {
        this.filteredReservations.data = this.prospectsArray.filter((reservation) =>
          new Date(reservation.llegada).toDateString() === new Date(date).toDateString()
        );
      } else {
        this.filteredReservations.data = this.prospectsArray;
      }
    }
  
    applySalidaDateFilter(date: Date) {
      if (date) {
        this.filteredReservations.data = this.prospectsArray.filter((reservation) =>
          new Date(reservation.salida).toDateString() === new Date(date).toDateString()
        );
      } else {
        this.filteredReservations.data = this.prospectsArray;
      }
    }
  
    applyStatusFilter(status: string) {
      if (status) {
        this.filteredReservations.data = this.prospectsArray.filter((reservation) => 
          reservation.estatus === status
        );
      } else {
        this.filteredReservations.data = this.prospectsArray;
      }
    }

    getColor(status: string): string {
        return this.colorMap[status] || this.colorMap['default'];
      }

      resetFilters() {
        // Reset form inputs
        this.filterText = '';
        this.specificDateValue = null;
        this.llegadaDateValue = null;
        this.salidaDateValue = null;
        this.selectedStatus = null;
      
        // Reset filtered data
        this.filteredReservations.filter = ''; // Clear the text filter
        this.filteredReservations.data = this.prospectsArray; // Reset the data source
      
        // Reset the paginator
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = 10;
      }
  }