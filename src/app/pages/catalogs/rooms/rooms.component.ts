import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, firstValueFrom, map, takeUntil } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { GroupingState } from 'src/app/_metronic/shared/models/grouping.model';
import { PaginatorState } from 'src/app/_metronic/shared/models/paginator.model';
import { SortState } from 'src/app/_metronic/shared/models/sort.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { NewRoomComponent } from './components/new-room/new-room.component';
import { FileUploadService } from 'src/app/services/file.upload.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ParametrosService } from '../../parametros/_services/parametros.service';
import { AddRoomComponent } from './components/more-rooms/more-rooms.component';
interface roomTable {
  Codigo:string,
  Tipo:string,
  Adultos:number,
  Inventario:number
}
export interface RowDetails {

Adultos:number,
Codigo:string,
Estatus:string,
Inventario:number,
Tipo:string,
Amenidades?:string[],
Tipos_Cama?:string[]
}
@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RoomsComponent implements OnInit{


    /**Table */
    dataSource = new MatTableDataSource<roomTable>();
    displayedColumns = ["expandCollapse", "Nombre de la habitación",
    "Tipo de la Habitación",
    "Capacidad Max.",
    "Inventario",
    "Acciones"];
    expandedElement: roomTable | null = null;


  /**Subscription */
  subscriptions:Subscription[]=[];
  private unsubscribe$ = new Subject<void>();

  habitacionesporCodigo:Habitacion[]=[]
  habitacionesArr:any[]=[]
  private ngUnsubscribe = new Subject<void>();
  dataSourceBS:Habitacion[]=[];

    //Filters
    paginator: PaginatorState;
    sorting: SortState;
    grouping: GroupingState;

      //DOM
  isLoading: boolean;
  blockedTabled:boolean=false;
  reloading:boolean=false
  closeResult: string;

    //Files
    fileList:any

  
  constructor(public _habitacionService: HabitacionesService,
    public modalService :NgbModal,
    public uploadService : FileUploadService,
    ){
      this._habitacionService.getcustomFormNotification().subscribe({
        next: async ()=>{
          this.getHabitaciones(true)
        },
        error: ()=>{

        }
      });
  }

  ngOnInit(){
    this.getImagenesHabitaciones();

    this.getHabitaciones(false)

    const sb = this._habitacionService.isLoading$.subscribe((res) => {
      this.isLoading = res
    });

    this._habitacionService.currentHabitacionSubject
      .pipe(takeUntil(this.unsubscribe$)) 
      .subscribe((value: boolean) => {
        this.getHabitaciones(value);
      });

    this.subscriptions.push(sb);
    
    this.isLoading=false;
  }

  async getHabitaciones(refreshTable:boolean){

    if(refreshTable){
      this.getAllRoomsEndPoint();
    }

    const roomsCodesIndexDB:Habitacion[] = await this._habitacionService.readIndexDB("Rooms");
    if(roomsCodesIndexDB){
      if(roomsCodesIndexDB.length !== 0){
        this._habitacionService.setcurrentHabitacionValue = roomsCodesIndexDB
        this.dataSourceBS = this._habitacionService.getcurrentHabitacionValue.getValue()
        this.buildDataSource(this.dataSourceBS);
      }else{
        this.getAllRoomsEndPoint();
      }
    }else
    {
       this.getAllRoomsEndPoint();
    }
  }

  getAllRoomsEndPoint(){

    this._habitacionService.getAll().pipe(
      takeUntil(this.ngUnsubscribe)).subscribe({
        next:()=>{
          this.dataSourceBS = this._habitacionService.getcurrentHabitacionValue.getValue()
          this.buildDataSource(this.dataSourceBS);
      }
    });
  }

  buildDataSource(data:Habitacion[]){
    let arrayUniqueByKey
    let newArray


        arrayUniqueByKey = [...new Map(data.map(item  =>
          [item['Codigo'], item])).values()];

        newArray = arrayUniqueByKey
          .map(({_id, Amenidades, Tipos_Camas, Numero, Descripcion, Vista, Camas, Tarifa, Orden, hotel, Ninos, URL, ...keepAttrs}) => keepAttrs)

        this.dataSource.data = newArray

      this.reloading=false;
      this.isLoading=false
  }

  toggleRow(row: any) {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  getDetailsByCodigo(codigo: string): Habitacion[] {
    const habs: Habitacion[] = this._habitacionService.getcurrentHabitacionValue.getValue();
      const details = habs.filter(habitacion => habitacion.Codigo === codigo);

      return details;
  }

  add(habitacion:roomTable){

    const modalRef = this.modalService.open(AddRoomComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacion;
    modalRef.componentInstance.editarHab=true
    modalRef.componentInstance.codigoCuarto = habitacion.Codigo
    modalRef.componentInstance.cuartosArray = this.dataSourceBS

    modalRef.componentInstance.honAddedRooms.subscribe({
      next:(responseMessage:string)=>{
        const alertsModalRef = this.modalService.open(AlertsComponent, {size:'sm', backdrop:'static'})
        alertsModalRef.componentInstance.alertHeader = 'Exito'
        alertsModalRef.componentInstance.mensaje = 'Habitaciones agregadas al inventario'
        
        alertsModalRef.result.then((result)=> {
          this.getHabitaciones(true);
          this.closeResult = `Closed with: ${result}`;

        }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        })
        setTimeout(() => {
          modalRef.close('Close click');
        },4000)
        return
      }
    })

    modalRef.result.then((result) => {
      console.log('Received nombreHabs:', result);
      this.habitacionesArr=[]
      this.habitacionesArr = result;

      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });  
  }

  getInventarioCount(row:Habitacion): number {
    return this.dataSourceBS.filter(item => item.Codigo === row.Codigo).length;
  }

  async delete(habitacion: any) {
    console.log(habitacion);
  
    const roomCount  = this.dataSourceBS.filter(item => item.Codigo === habitacion.Codigo);
  
    const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
    modalRef.componentInstance.alertHeader = 'Advertencia';
    modalRef.componentInstance.mensaje = '¿Estás seguro de que deseas eliminar la habitación?';
  
    try {
      const result = await modalRef.result;
      if (result !== 'Aceptar') {
        this.isLoading = false;
        return;
      }
  
      this.isLoading = true;
  
      if (roomCount.length === 1) {
        // Last room for this room code - Confirm deletion
        const modalRefCodeDelete = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
        modalRefCodeDelete.componentInstance.alertHeader = 'Advertencia';
        modalRefCodeDelete.componentInstance.mensaje = 'Este es el último inventario para este código de cuarto, al eliminar la habitacion tambien lo hara el cuarto. ¿Desea continuar?';
  
        const resultCodeDelete = await modalRefCodeDelete.result;
        if (resultCodeDelete === 'Aceptar') {
          await this.deleteRoom(habitacion.Codigo);
        }
      } else {
        // Delete a single room
        await this.deleteRoom(habitacion.Codigo, habitacion.Numero);
      }
    } catch (reason) {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    } finally {
      this.isLoading = false;
    }
  }
  
  private async deleteRoom(codigo: string, numero: string= 'NN') {
    try {
      const response = await firstValueFrom(this._habitacionService.deleteHabitacion(codigo, numero));
  
      if ( ( response as { message: string }).message !== 'Success' ) {
        this.promptMessage('Error', 'Aún existen huéspedes asignados a este código de cuarto. Cambie el tipo de cuarto de los huéspedes y vuelva a intentarlo.');
      } else {
        await this.getHabitaciones(true);
        this.promptMessage('Éxito', 'Habitación eliminada con éxito.');
      }
    } catch (error) {
      this.promptMessage('Error', 'No se pudo eliminar la habitación. Intente de nuevo.');
    }
  }

  altaDehabitacion(){
    const modalRef=this.modalService.open(NewRoomComponent,{ size: 'lg', backdrop:'static' })
    modalRef.componentInstance.editarHab=false
    modalRef.componentInstance.edicion=false
  }

  edit(row:RowDetails){
    const imagen = this.getRoomImg(row.Codigo);

    const habitacionCompleta = this.dataSourceBS.filter(item=>item.Codigo === row.Codigo)[0]

    const modalRef=this.modalService.open(NewRoomComponent,{ size: 'lg', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacionCompleta
    modalRef.componentInstance.edicion=true
    modalRef.componentInstance.imagen=imagen[0].url

    modalRef.result.then((result)=>{
      this.habitacionesArr=[]

      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
        this.fileList=[]
        this.getImagenesHabitaciones()
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  getRoomImg(codigoHab:string){
    return this.fileList.filter((c:any)=>c.name.split('.')[0] == codigoHab);
  }

  promptMessage(header:string,message:string){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = header
    modalRef.componentInstance.mensaje= message    
    modalRef.result.then((result) => {
      if(result=='Aceptar')        
      {
        // this.deleteTarifaRackEspecial(element)
        // this.tarifaEspecialArray=[]
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

  getImagenesHabitaciones(){
    this.uploadService.getAllFiles().snapshotChanges().pipe(
      map((changes:any) =>
        changes.map((c:any) => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe((fileUploads:any) => {
      this.fileList = fileUploads;
    });
  }

 

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

