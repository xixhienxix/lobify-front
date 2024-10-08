import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import * as keenIcons from 'src/app/_metronic/shared/keenicon/icons.json';

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
  tabVisible: boolean = false;

  @Input() reservasSubject: BehaviorSubject<Huesped[]> = new BehaviorSubject<Huesped[]>([]);

  itemClass: string = 'ms-1 ms-lg-3';
  btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.reservasSubject
      .asObservable()
      .subscribe(value=>{
        this.initializeCounter(value);
      })
      console.log(this.icons)
  }

  getIcon(iconName: string): string {
    return this.icons[iconName];
  }

  toggleTab() {
    this.tabVisible = !this.tabVisible;
  }

  async initializeCounter(reservations:Huesped[]){
    const statusGroup2 = reservationStatusMap[2];// Reservations Groups

    const todayDate = new Date();
    const llegadas = reservations.filter((item)=>{

      if(statusGroup2.includes(item.estatus)){
        const llegada = new Date(item.llegada);

        if(llegada.setHours(0,0,0,0) === todayDate.setHours(0,0,0,0)){
          return item
        }
      }
    });
    this.llegadas = llegadas.length;

    const salidas = reservations.filter((item)=>{
    const salida = new Date(item.salida);

      if(salida.setHours(0,0,0,0) === todayDate.setHours(0,0,0,0)){
        return item
      }
    });
    this.salidas = salidas.length;

    const noShow = reservations.filter((item)=>{
      const llegada = new Date(item.llegada);
  
        if(llegada.setHours(0,0,0,0) >= todayDate.setHours(0,0,0,0)){
          if(statusGroup2.includes(item.estatus)){
            return item
          }
        }
      });
      this.noShow = noShow.length;

    this.changeDetector.detectChanges();

  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
