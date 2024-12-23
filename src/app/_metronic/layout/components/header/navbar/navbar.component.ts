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
    private router: Router
  ) {}

  ngOnInit(): void {
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

  async initializeCounter(reservations:Huesped[]){
    const statusGroup2 = reservationStatusMap[2];// Reservations Groups

    const todayDate = new Date();

    // Llegadas Count
    const currentDate = DateTime.local(); // Get current local time
    const todayDateString = currentDate.toISODate(); // Get today's date in ISO format (YYYY-MM-DD)

    const currentDateMoment = new Date();

    const currentMonth = currentDateMoment.getMonth();
    const currentYear = currentDateMoment.getFullYear();
  
    const llegadas = reservations.filter((huesped) => {
      const llegadaDate = new Date(huesped.llegada);
      const salidaDate = new Date(huesped.salida);

      const isThisMonth =
        (llegadaDate.getMonth() === currentMonth && llegadaDate.getFullYear() === currentYear) ||
        (salidaDate.getMonth() === currentMonth && salidaDate.getFullYear() === currentYear);

      const matchesEstatus = reservationStatusMap[2].includes(huesped.estatus);

      return isThisMonth && matchesEstatus;
    });
    this.llegadas = llegadas.length;
    //

    // Salidas Count

    const salidas = reservations.filter((huesped) => {
      const salidaDate = DateTime.fromISO(huesped.salida).startOf('day'); // Parse the 'salida' date and normalize to the start of the day
  
      const isSameDayAsToday = salidaDate.toISODate() === todayDateString; // Compare if salida is the same day as today
  
      const matchesEstatus = reservationStatusMap[1].includes(huesped.estatus);
  
      return isSameDayAsToday && matchesEstatus;
    });

    this.salidas = salidas.length;
    //

    // Colgados Count
    const colgados = reservations.filter((huesped) => {
      const salidaDate = DateTime.fromISO(huesped.salida).startOf('day'); // Parse the 'salida' date and normalize to the start of the day
  
      const isSameDayAsToday = salidaDate.toISODate()! <= todayDateString; // Compare if salida is the same day as today
  
      const matchesEstatus = reservationStatusMap[1].includes(huesped.estatus);
  
      return isSameDayAsToday && matchesEstatus;
    });

    this.colgados = colgados.length;
    //

    // No Show Count
    const noshow =  reservations.filter((huesped) => {
      const llegadaDate = new Date(huesped.llegada);
      const salidaDate = new Date(huesped.salida);

      const isThisMonth =
        (llegadaDate.getMonth() === currentMonth && llegadaDate.getFullYear() === currentYear) ||
        (salidaDate.getMonth() === currentMonth && salidaDate.getFullYear() === currentYear);

      const matchesEstatus = reservationStatusMap[8].includes(huesped.estatus);

      return isThisMonth && matchesEstatus;
    });

    this.noShow = noshow.length;
    //



    this.changeDetector.detectChanges();

  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
