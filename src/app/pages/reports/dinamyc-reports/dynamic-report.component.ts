/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
import { DateTime } from 'luxon';
import { CommunicationService } from '../_services/event.services';
import { Parametros } from '../../parametros/_models/parametros';
import { ParametrosService, timeZoneToLocaleMap } from '../../parametros/_services/parametros.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { EstatusService } from '../../calendar/_services/estatus.service';

@Component({
  selector: 'app-dynamic-report',
  templateUrl: './dynamic-report.component.html',
  styleUrls: ['./dynamic-report.component.scss']
})
export class DynamicReportComponent implements OnInit, AfterViewInit, OnDestroy {
  colorDict = {
    0: '#a6e390',
    1: '#fab3db',
    2: '#d0aaec',
    3: '#ffce54',
    4: '#fb7f8c',
    5: '#808080',
    6: '#a8d5e5'
  };

  @Input() colorMap: Record<string, string> = {};
  @Input() displayedColumns: string[] = [];
  @Input() dataArray: any[] = [];
  @Input() statusOptions: string[] = [];

  @Output() onActionClick = new EventEmitter<any>();

  filteredReservations = new MatTableDataSource<any>([]);
  filterText: string = '';
  filterFolio: string = '';
  filterRoomCode: string = '';
  filterDateValue: Date | null = null;
  llegadaDateValue: Date | null = null;
  salidaDateValue: Date | null = null;
  selectedStatus: string | null = null;
  reportType: string = '';
  currentParametros: Parametros

  allReservaciones: any[] = [];
  prospectsArray: any[] = [];

  // Store initial values for each row
  initialStatuses: { [key: string]: string } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private route: ActivatedRoute,
    private indexDbService: IndexDBCheckingService,
    private communicationService: CommunicationService,
    private cdRef: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _estatusService: EstatusService
    ) {}

  async ngOnInit(): Promise<void> {

    this.indexDbService.checkIndexedDB(['parametros'],true);
    this.currentParametros = await  this.indexDbService.loadParametros(true);

    this.loadColors();
    await this.indexDbService.checkIndexedDB(['reservaciones'], true);
    this.allReservaciones = await this.indexDbService.loadReservaciones();

    // Filters
    this.filteredReservations.filterPredicate = (data: any, filter: string): boolean => {
      const parsedFilter = JSON.parse(filter); // Parse the filter string into an object
      
      // Existing logic for other fields (name, folio, estatus, habitacion)
      const nameMatches = data.nombre.toLowerCase().includes(parsedFilter.nombre?.toLowerCase() || '');
      const folioMatches = data.folio.toLowerCase().includes(parsedFilter.folio?.toLowerCase() || '');
      const estatusMatches = data.estatus === parsedFilter.estatus || !parsedFilter.estatus;
      const habitacionMatches = data.habitacion === parsedFilter.habitacion || !parsedFilter.habitacion;
      
      // Date matching (Convert 'llegada' to ISODate)
      const llegadaMatches = parsedFilter.llegada 
        ? data.llegada === parsedFilter.llegada 
        : true;
      
      return nameMatches && folioMatches && estatusMatches && habitacionMatches && llegadaMatches;
    };
    
    this.communicationService.onReportsUpdated$.subscribe({
      next:async (reportType)=>{
        if(reportType){
          await this.indexDbService.checkIndexedDB(['reservaciones'], true);
          this.allReservaciones = await this.indexDbService.loadReservaciones(true);

          this.loadReportData();
        }
      }
    });

    this.route.params.subscribe((params) => {
      this.reportType = params['reportType'];
      this.loadDynamicColumnsProspects();

      this.loadReportData();
    });

  }

  loadDynamicColumnsProspects(): void {
    this.displayedColumns = ['nombre', 'telefono', 'email', 'llegada', 'salida', 'estatus', 'acciones'];

    // Example of dynamically adding columns based on some logic
    if (this.displayedColumns && !this.displayedColumns.includes('acciones')) {
      
      this.displayedColumns.push('acciones');
    }

    // Add your dynamic data here, if needed
    this.filteredReservations.data = this.dataArray;
  }

  loadReportData(): void {
    this.filteredReservations.data = []
    this.filteredReservations.paginator = null

    const statusMap: { [key: string]: number } = {
      'prospects': 2,
      'salidas': 1,
      'colgados': 1,
      'noshow': 8,
      'llegadas':2,
      'inhouse': 1,
      'clientes': 3
    };
    
    const statusKey = statusMap[this.reportType];
    if (statusKey !== undefined) {
      if (this.reportType === 'clientes') {
        this.statusOptions = [
          ...reservationStatusMap[8],
          ...reservationStatusMap[4]
        ];
      }else {
        this.statusOptions = [...reservationStatusMap[statusKey]];
      }
      this.loadReport();
    }
  }

  loadReport(): void {
    // Filter prospects
    this.prospectsArray = this.filterHuespedes(this.allReservaciones,this.reportType);
    this.filteredReservations.data = this.prospectsArray
    this.filteredReservations.paginator = this.paginator;
    this.filteredReservations.data.forEach(element => {
      this.setInitialStatus(element); // Store the initial status value for each element
    });
  }

  filterHuespedes(huespedes: any[], reportType:string): any[] {
    const currentDate = DateTime.local().setZone(this.currentParametros.codigoZona); // Get current local time
    const todayDateString = currentDate.toISODate(); // Today's date in ISO format (YYYY-MM-DD)

    const filterByStatus = (huesped: Huesped): boolean => {
      return this.statusOptions.includes(huesped.estatus);
    };

    if (reportType === 'colgados') {
      return huespedes.filter(huesped => {
        if (!huesped.salida || !todayDateString) {
          return false; // Skip if either salida or todayDateString is null/undefined
        }
        
        const parsedSalida = DateTime.fromISO(huesped.salida);
        if (!parsedSalida.isValid) {
          return false; // Skip if the parsed salida date is invalid
        }
        
        const statusMatches = filterByStatus(huesped);
        return parsedSalida.toISODate() <= todayDateString && statusMatches;
      });
    } else if(reportType === 'salidas') { 
      //        (isThisMonth(huesped.llegada) || isThisMonth(huesped.salida)) &&
      //filterByStatus(huesped, 8)
      return huespedes.filter(huesped => {
        if (!huesped.salida || !todayDateString || !huesped.llegada) {
          return false; // Skip if either salida or todayDateString is null/undefined
        }
        
        const salidasMatches = this.isToday(huesped.salida);

        const statusMatches = filterByStatus(huesped);
        return salidasMatches && statusMatches;
      });
    } else if(reportType === 'prospects') {
      return huespedes.filter(huespedes=>filterByStatus(huespedes));
    } else if(reportType === 'llegadas') { 
      //        (isThisMonth(huesped.llegada) || isThisMonth(huesped.salida)) &&
      //filterByStatus(huesped, 8)
      return huespedes.filter(huesped => {
        if (!huesped.llegada || !todayDateString) {
          return false; // Skip if either salida or todayDateString is null/undefined
        }
        
        const llegadaMatches = this.isToday(huesped.llegada);

        const statusMatches = filterByStatus(huesped);
        return llegadaMatches && statusMatches;
      });
    }else if(reportType === 'noshow') {
      return huespedes.filter(huesped => {
        const statusMatches = filterByStatus(huesped);
        return statusMatches
      });
    } else if(reportType === 'inhouse') {
      return huespedes.filter(huesped => {
        const statusMatches = filterByStatus(huesped);
        return statusMatches
      });
    } else if (reportType === 'clientes') {
      return huespedes.filter(huesped => {
        const statusMatches = filterByStatus(huesped);
        return statusMatches
      });
    }
    return []
  }

  onStatusChange(element:any){
    if(element){
      const modalRef = this._modalService.open(AlertsComponent, {size:'sm', backdrop:'static'})
      modalRef.componentInstance.alertHeader = 'Advertencia';
      modalRef.componentInstance.mensaje = 'Esta seguro que desea actualizar el estatus del húesped?';

      modalRef.result.then((result) => {
        if (result === 'Aceptar') {
          this.updateEstatusHuesped(element);        
        } else {
          this.resetStatus(element);
        }
      });
    }
  }

  updateEstatusHuesped(huesped:Huesped){
    this.communicationService.onChangeEstatusHuesped(huesped);       
  }

  loadColors(): void {
    // Define color mapping
    this.colorMap = {
      'Huesped en Casa': this.colorDict[0],
      'Reserva Sin Pago': this.colorDict[3],
      'Reserva Confirmada': this.colorDict[6],
      'Deposito Realizado': this.colorDict[6],
      'Esperando Deposito': this.colorDict[6],
      'Totalmente Pagada': this.colorDict[6],
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
  }

  ngAfterViewInit(): void {
    this.filteredReservations.paginator = this.paginator;
  }

  // applyFilter(filters: { nombre?: string; folio?: string; estatus?: string; habitacion?: string }): void {
  //   this.filteredReservations.filter = JSON.stringify(filters); // Convert filters to a JSON string
  // }
  applyDateFilter(event: any): void {
    const dateFilter = event.value; // Get the selected date (moment object)
    const formattedDate = dateFilter ? dateFilter.format('YYYY-MM-DD') : ''; // Format the date to match 'llegada'
    this.applyFilter({ llegada: formattedDate, salida: formattedDate }); // Apply the date filter
  }
  
  applyFilter(filters: { nombre?: string; folio?: string; codigoCuarto?:string; estatus?: string; habitacion?: string; llegada?: string; salida?: string }): void {
    console.log('filtros:', filters);
  
    // Start with the full array as the initial data
    let filteredData = this.prospectsArray;
  
    // Apply each filter progressively, making sure that each filter respects the others
  
    // Apply 'nombre' filter if present
    if (filters.nombre) {
      filteredData = filteredData.filter((reservation) =>
        reservation.nombre.toLowerCase().includes(filters.nombre!.toLowerCase())
      );
    }

    // Aply Folio Filter
    if (filters.folio) {
      filteredData = filteredData.filter((reservation) =>
        reservation.folio.toUpperCase().includes(filters.folio!.toUpperCase())
      );
    }

    // Aply Codigo Caurto Filter
    if (filters.codigoCuarto) {
      filteredData = filteredData.filter((reservation) =>
        reservation.habitacion.toUpperCase().includes(filters.codigoCuarto!.toUpperCase())
      );
    }
  
    // Apply 'llegada' filter if present (Date comparison ignoring time)
    if (filters.llegada) {
      filteredData = filteredData.filter((reservation) =>
        DateTime.fromISO(reservation.llegada).toISODate() === DateTime.fromISO(filters.llegada!).toISODate()
      );
    }
  
    // Apply 'estatus' filter if present
    if (filters.estatus) {
      filteredData = filteredData.filter((reservation) =>
        reservation.estatus === filters.estatus
      );
    }
  
    // Apply 'habitacion' filter if present
    if (filters.habitacion) {
      filteredData = filteredData.filter((reservation) =>
        reservation.habitacion === filters.habitacion
      );
    }
  
    // If no matches were found after applying all filters, log that the data is empty
    if (filteredData.length === 0) {
      console.log('No data found after applying all filters');
    } else {
      console.log('Filtered data:', filteredData);
    }
  
    // Update the filtered reservations data
    this.filteredReservations.data = filteredData;
  }
  
  
  formatDate(dateString: string, language: string = 'en'): string {
    return DateTime.fromISO(dateString).setLocale(timeZoneToLocaleMap[this.currentParametros.codigoZona]).toLocaleString({
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).replace(',', '').replace('de', 'de');;
  }


  applyStatusFilter(status: string): void {
    if (status) {
      this.applyFilter({ estatus: status });  // Apply the filter through applyFilter
    } else {
      this.applyFilter({ estatus: '' });  // Clear the status filter when no status is selected
    }
  }

  resetFilters(): void {
    this.filterText = ''; // Reset the filter text
    this.filterFolio = ''; // Reset the filter text
    this.filterDateValue = null; // Reset the date filter
    this.selectedStatus = ''; // Reset the status filter
    
    // Reset the filtered data to show all prospects
    this.filteredReservations.data = this.prospectsArray;
  }
  

  isThisMonth = (date: string): boolean => {
    const currentDate = DateTime.local().setZone(this.currentParametros.codigoZona);
    const { day, month, year } = currentDate
    const parsedDate = DateTime.fromISO(date);
    return parsedDate.month === month && parsedDate.year === year;
  };

  isToday = (date: string): boolean => {
    const currentDate = DateTime.local().setZone(this.currentParametros.codigoZona);
    const { day, month, year } = currentDate
    const parsedDate = DateTime.fromISO(date);
    return parsedDate.hasSame(currentDate, 'day'); // Check if the date is the same day
  };

  getColor(status: string): string {
    return this.colorMap[status] || this.colorMap['default'];
  }

  emitAction(element: any): void {
    this.communicationService.emitEvent(element);
  }

    // Function to store the initial value when the data is loaded
  setInitialStatus(element: any): void {
    if (!this.initialStatuses[element._id]) {  // Assuming each element has a unique 'id'
      this.initialStatuses[element._id] = element.estatus;
    }
  }

  // Function to reset to the initial status
  resetStatus(element: any): void {
    const initialStatus = this.initialStatuses[element._id];
    if (initialStatus) {
      element.estatus = initialStatus; // Reset to initial value
      this.cdRef.detectChanges(); // Trigger change detection manually
    }
  }

  ngOnDestroy(){
  this.filteredReservations.data = []  
  }

}



