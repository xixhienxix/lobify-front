import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Bloqueo } from "src/app/_metronic/layout/components/header/bloqueos/_models/bloqueo.model";
import { reservationStatusMap } from "src/app/models/huesped.model";
import { IndexDBCheckingService } from "src/app/services/_shared/indexdb.checking.service";
import { BloqueoService } from "src/app/services/bloqueo.service";

@Component({
    selector:'app-bloqueos-reports',
    templateUrl:'./out-of-service.component.html',
    styleUrls:['./out-of-service.component.scss'],
    encapsulation:ViewEncapsulation.None
})
export class OutOfServiceComponent implements OnInit{
    constructor( 
        private _checkIndexDb: IndexDBCheckingService,
        private _modalService:NgbModal,
        private _bloqueoService : BloqueoService
    ){

    }

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
    bloqueosArray: Bloqueo[] = [];
    allBloqueos: Bloqueo[] = [];
    filteredBloqueos = new MatTableDataSource<Bloqueo>(this.bloqueosArray);
    displayedColumns: string[] = ['Habitacion', 'Cuarto', 'Desde', 'Estatus', 'Comentarios', 'acciones'];
    dataSource = new MatTableDataSource<any>();

    specificDateValue: Date | null = null;  // For the specific date filter
    llegadaDateValue: Date | null = null;   // For the "Llegada" date filter
    salidaDateValue: Date | null = null;    // For the "Salida" date filter
    selectedStatus: string | null = null;   // For the status filter
    closeResult:string;

    idDelete:string;
    desdeDelete:string;
    hastaDelete:string;
    habitacionDelete:Array<string>;
    numeroDelete:Array<number>;
    isLoading:boolean=true
    statusBloqueo:string

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('exito') miniModal = null;


    ngOnInit(): void {
      this._checkIndexDb.checkIndexedDB(['bloqueos'])
        this._checkIndexDb.bloqueos$.subscribe({
          next: (bloqueos) => {
            this.allBloqueos = bloqueos;
            this.bloqueosArray = this.filterBloqueos(this.allBloqueos);
            this.dataSource.data = this.allBloqueos
            this.filteredBloqueos.data = this.bloqueosArray; // Set initial filtered data}      
            this.filteredBloqueos.paginator = this.paginator; // Set paginator
            this.isLoading=false

          }
        });
      }

      displayRooms(element:Bloqueo){
        return element.Cuarto.map(item=>{
          return item
        }).join('<br>')
      }
        
    filterBloqueos(bloqueos: Bloqueo[]): Bloqueo[] {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
  
      return bloqueos.filter((bloqueo) => {
        const llegadaDate = new Date(bloqueo.Desde);
        const salidaDate = new Date(bloqueo.Hasta);
  
        const isThisMonth =
          (llegadaDate.getMonth() === currentMonth && llegadaDate.getFullYear() === currentYear) ||
          (salidaDate.getMonth() === currentMonth && salidaDate.getFullYear() === currentYear);
  
        //   const matchesEstatus = reservationStatusMap[8].includes(blko.estatus) || reservationStatusMap[2].includes(huesped.estatus);
  
        return isThisMonth;
      });
    }

    displayFechas(element:any){
        const desde = element.Desde.split('T')[0]
        const hasta = element.Hasta.split('T')[0]
      
        return desde + '<br>' + hasta
      }

      onCheckboxChange(bloqueo: any, key: string, checked: boolean) {
        bloqueo[key] = checked;
      }

      borrar(_id:string,desde:string,hasta:string,habitacion:Array<string>,numero:Array<number>) {
        const desdeISOString = new Date(desde)
        const astaISOString = new Date(hasta)

        const sb = this._bloqueoService.deleteBloqueo(_id).subscribe((response)=>{
           if(response.status==200)
             {
               this.statusBloqueo="Bloqueo Borrado Correctamente"
               this.openMini(this.miniModal)
     
              const sb = this._bloqueoService.liberaBloqueos(_id,desdeISOString,astaISOString,habitacion,numero).subscribe((response)=>{
                 console.log("liberaDispo responxse",response)
               });
              }
             else
             {
               this.statusBloqueo="Hubo un problema al eliminar el bloqueo, Actualize la pagina y intente nuevamente"
               this.openMini(this.miniModal)
             }
           })
       }

       openMini(exito:any) {

        const modalRef = this._modalService.open(exito,{ size: 'sm', backdrop:'static' });
        modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        setTimeout(() => {
          modalRef.close('Close click');
        },4000)
      }
    

        // Convert object to array of entries
  objectEntries(obj: Record<string, boolean>): { key: string; value: boolean }[] {
    const { sinLlegadas, sinSalidas, ...newObj } = obj;

    return Object.entries(newObj).map(([key, value]) => ({ key, value: value as boolean }));
  }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.filteredBloqueos.filter = filterValue;
    }

    // applySpecificDateFilter(date: Date) {
    //     if (date) {
    //       this.filteredBloqueos.data = this.bloqueosArray.filter((bloqueos) =>
    //         new Date(bloqueos.creada).toDateString() === new Date(date).toDateString()
    //       );
    //     } else {
    //       this.filteredBloqueos.data = this.bloqueosArray;
    //     }
    //   }
    openDeleteModal(borrar:any,id:any,desde:any,hasta:any,habitacion:any,numero:any) {

        const modalRef = this._modalService.open(borrar,{ size: 'sm', backdrop:'static' });
        this.idDelete = id
        this.desdeDelete = desde
        this.hastaDelete = hasta
        this.habitacionDelete = habitacion
        this.numeroDelete = numero
      
        modalRef.result.then((result:any) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason:any) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
        setTimeout(() => {
          modalRef.close('Close click');
        },4000)
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

    resetFilters() {
        // Reset form inputs
        this.filterText = '';
        this.specificDateValue = null;
        this.llegadaDateValue = null;
        this.salidaDateValue = null;
        this.selectedStatus = null;
      
        // Reset filtered data
        this.filteredBloqueos.filter = ''; // Clear the text filter
        this.filteredBloqueos.data = this.bloqueosArray; // Reset the data source
      
        // Reset the paginator
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = 10;
      }
}