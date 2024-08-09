import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Huesped } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];

  @Input() appHeaderDefaulMenuDisplay: boolean;
  @Input() isRtl: boolean;
  llegadas: number;
  salidas: number;

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
  }

  async initializeCounter(reservations:Huesped[]){

    const todayDate = new Date();
    const llegadas = reservations.filter((item)=>{

      if(item.origen === 'Reserva'){
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

    this.changeDetector.detectChanges();

  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
