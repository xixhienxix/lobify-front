import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import * as keenIcons from 'src/app/_metronic/shared/keenicon/icons.json';
import { Route, Router } from '@angular/router';
import { DateTime } from 'luxon'
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  icons: any = keenIcons;

  @Input() appHeaderDefaulMenuDisplay: boolean;
  @Input() isRtl: boolean;
  
  @Input() parametrosModel: Parametros;
  @Input() roomCodesComplete: Habitacion[];
  @Input() estatusArray: Estatus[];
  @Input() ratesArrayComplete: Tarifas[];
  @Input() houseKeepingCodes: boolean;  
  @Input() codigosCargo: boolean;
  @Input() dataSource: boolean;



  llegadas: number;
  salidas: number;
  noShow: number;
  colgados: number;
  tabVisible: boolean = false;

  @Input() reservasSubject: BehaviorSubject<Huesped[]> = new BehaviorSubject<Huesped[]>([]);

  itemClass: string = 'ms-1 ms-lg-3';
  btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';

  constructor(private changeDetector: ChangeDetectorRef,
    private router: Router,
    private _indexDbChecker: IndexDBCheckingService
  ) {}

  async ngOnInit(): Promise<void> {
    this.parametrosModel = await this._indexDbChecker.loadParametros();
    this.reservasSubject
      .asObservable()
      .subscribe(value=>{
        this.initializeCounter(value);
      })
  }

  navigateTo(reportType: string): void {
    this.router.navigate([`/reports/${reportType}`]); // Add a leading slash
  }

  getIcon(iconName: string): string {
    return this.icons[iconName];
  }

  async initializeCounter(reservations: Huesped[]) {
    const currentDate = DateTime.local().setZone(this.parametrosModel.codigoZona); // Get current local time
    const todayDateString = currentDate.toISODate(); // Today's date in ISO format (YYYY-MM-DD)
    const { day: currentDay, month: currentMonth, year: currentYear } = currentDate; // Destructure day, month, and year
  
    const isThisMonth = (date: string): boolean => {
      const parsedDate = DateTime.fromISO(date);
      return parsedDate.month === currentMonth && parsedDate.year === currentYear;
    };

    const isToday = (date: string): boolean => {
      const parsedDate = DateTime.fromISO(date);
      return parsedDate.hasSame(currentDate, 'day'); // Check if the date is the same day
    };
  
    const filterByStatus = (huesped: Huesped, statusIndex: number): boolean => {
      return reservationStatusMap[statusIndex].includes(huesped.estatus);
    };
  
    // Llegadas Count
    this.llegadas = reservations.filter(
      (huesped) =>
        (isToday(huesped.llegada)) &&
        filterByStatus(huesped, 2)
    ).length;
  
    // Salidas Count
    this.salidas = reservations.filter(
      (huesped) =>
        isToday(huesped.salida) &&
        filterByStatus(huesped, 1)
    ).length;
  
    // Colgados Count
    this.colgados = reservations.filter(
      (huesped) =>
        DateTime.fromISO(huesped.salida).toISODate()! <= todayDateString! &&
        filterByStatus(huesped, 1)
    ).length;
  
    // No Show Count
    this.noShow = reservations.filter(
      (huesped) =>
        filterByStatus(huesped, 8)
    ).length;
  
    // Trigger change detection
    this.changeDetector.detectChanges();
  }
  

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
