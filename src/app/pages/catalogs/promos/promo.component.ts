import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ModalDismissReasons, NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Promos } from "src/app/models/promos";
import { PromosService } from "src/app/services/promos.service";
import { NuevaPromocionModalComponent } from "./nva-promo/nva-promo.component";
import { HabitacionesService } from "src/app/services/habitaciones.service";
import { Subject, takeUntil } from "rxjs";
import { Habitacion } from "src/app/models/habitaciones.model";
import { Prompt } from "src/app/models/prompt.model";
import { AlertsComponent } from "src/app/_metronic/shared/alerts/alerts.component";
export type listaCamas = {key:number;value:string;}

@Component({
    selector:'app-promo-',
    styleUrls:['./promo.component.scss'],
    templateUrl:'./promo.component.html'  
})
export class PromoComponent implements OnInit {

    isLoading: boolean = false;
    reloading:boolean = false;
    closeResult:string;
    cuartosArray:Habitacion[]=[];
    disponiblesIndexadosCamas:listaCamas[]=[]

    displayColumnsPromocion:string[] = ['Nombre', 'Tipo', 'Periodo', 'Estado','Acciones'];
    dataSourcePromociones = new MatTableDataSource<any>();
    
    private ngUnsubscribe = new Subject<void>();

    constructor (
        private modalService: NgbModal,
        private promosService:PromosService,
        private _habitacionService:HabitacionesService
     ) {

    }

    ngOnInit(): void {
        this.getPromos(true);

        this._habitacionService.getAll().pipe(
                takeUntil(this.ngUnsubscribe)).subscribe({
                  next:()=>{
                    this.cuartosArray = this._habitacionService.getcurrentHabitacionValue.getValue();
                    const uniqueCuartos = new Map(this.cuartosArray.map(c => [c.Codigo, c]));
                    const codigoCuarto = Array.from(uniqueCuartos.values());

                    this.disponiblesIndexadosCamas = codigoCuarto.map((cuarto, i) => ({ key: i, value: cuarto.Codigo }));

                }
        });
    }

    getPromos(refresh:boolean){
        this.promosService.getAll().subscribe({
            next:(value)=>{
                console.log(value)
            }
        })
    }

    formatDates(promos:Promos){

    }

    promocionesActivas(activePromos:Promos){

    }

    estado(active:boolean){

    }

    editarPromocion(editPromo:Promos){

    }

    deletePromocion(deletePromo:Promos){

    }

    nvaPromocion(){
        const modalRef=this.modalService.open(NuevaPromocionModalComponent,{ size: 'md', backdrop:'static' });
        modalRef.componentInstance.disponiblesIndexadosCamas = this.disponiblesIndexadosCamas
        modalRef.componentInstance.honAlertsEvent.subscribe({
            next:(value:Prompt)=>{
            this.promptMessage(value.title,value.message);
            }
        })
        modalRef.result.then((result)=>{
        //this.getHabitaciones(false);
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

    }

      promptMessage(header:string,message:string){
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = header
        modalRef.componentInstance.mensaje= message    
        modalRef.result.then((result) => {
          if(result=='Aceptar')        
          {
          } 
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
      }

    private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
    }
}