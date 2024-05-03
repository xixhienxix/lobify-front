import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, distinctUntilChanged, distinctUntilKeyChanged, map, takeUntil } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { GroupingState } from 'src/app/_metronic/shared/models/grouping.model';
import { PaginatorState } from 'src/app/_metronic/shared/models/paginator.model';
import { SortState } from 'src/app/_metronic/shared/models/sort.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { HabitacionesService } from 'src/app/services/habitaciones.service';
import { NewRoomComponent } from './components/new-room/new-room.component';
import { FileUploadService } from 'src/app/services/file.upload.service';
interface roomTable {
  Codigo:string,
  Tipo:string,
  Adultos:number,
  Inventario:number
}
@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
})
export class RoomsComponent implements OnInit{


    /**Table */
    dataSource = new MatTableDataSource<roomTable>();
    displayedColumns = ["Nombre de la habitación",
    "Tipo de la Habitación",
    "Capacidad Max.",
    "Inventario",
    "Acciones"];

  /**Subscription */
  subscriptions:Subscription[]=[]
  habitacionesporCodigo:Habitacion[]=[]
  habitacionesArr:any[]=[]
  private ngUnsubscribe = new Subject<void>();


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
        next: async (val)=>{
          // if(val){
          //   this.promptMessage('Exito','Habitación(es) Generadas con éxito')
          // }
          // if(!val){
          //   this.promptMessage('Error','No se pudo guardar la habitación intente de nuevo mas tarde')
          // }
          this.getHabitaciones(false)
        },
        error: (error)=>{

        }
      });
  }

  ngOnInit(){
    this.getImagenesHabitaciones();

    this.getHabitaciones(false)

    const sb = this._habitacionService.isLoading$.subscribe((res) => {
      this.isLoading = res
    });
    this.subscriptions.push(sb);
    
    this.isLoading=false;
  }

  async getHabitaciones(refreshTable:boolean){

    let dataSourceBS
    if(refreshTable){
      this.getAllRoomsEndPoint();
    }

    const roomsCodesIndexDB:Habitacion[] = await this._habitacionService.readIndexDB("Rooms");
    if(roomsCodesIndexDB){
      if(roomsCodesIndexDB.length !== 0){
        this._habitacionService.setcurrentHabitacionValue = roomsCodesIndexDB
        dataSourceBS = this._habitacionService.getcurrentHabitacionValue.getValue()
        this.buildDataSource(dataSourceBS);
      }else{
        this.getAllRoomsEndPoint();
      }
    }else
    {
       this.getAllRoomsEndPoint();
    }
  }

  getAllRoomsEndPoint(){
    let dataSourceBS

    this._habitacionService.getAll().pipe(
      takeUntil(this.ngUnsubscribe)).subscribe({
        next:(val:Habitacion[])=>{
          dataSourceBS = this._habitacionService.getcurrentHabitacionValue.getValue()
          this.buildDataSource(dataSourceBS);
      }
    });
  }

  buildDataSource(data:Habitacion[]){
    let codigosCuarto
    let arrayUniqueByKey
    let newArray

    codigosCuarto = [...new Set(data.map(item => item.Codigo))];

        arrayUniqueByKey = [...new Map(data.map(item  =>
          [item['Codigo'], item])).values()];

        newArray = arrayUniqueByKey
          .map(({_id, Amenidades, Tipos_Camas, Numero, Descripcion, Vista, Camas, Tarifa, Orden, hotel, Ninos, URL, ...keepAttrs}) => keepAttrs)

        this.dataSource.data = newArray

      this.reloading=false;
      this.isLoading=false
  }

  add(habitacion:roomTable){
    let habitacionSeleccionada = this._habitacionService.getcurrentHabitacionValue.getValue();
    const filter = habitacion.Codigo
    let habs2 = habitacionSeleccionada.find( val => val.Codigo === filter);
    const modalRef = this.modalService.open(NewRoomComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.habitacion=habs2;
    modalRef.componentInstance.editarHab=true
    modalRef.result.then((result) => {
      this.habitacionesArr=[]
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });  
  }

  

  delete(habitacion:any,index:number){
    this.isLoading=true
    this._habitacionService.deleteHabitacion(habitacion.Codigo).subscribe({
      next:async (data)=>{
        if(data!=0 && data!= null)
          {
            this.promptMessage('Error','Aun existen huespedes asignados a este codigo de cuarto, cambie el tipo de cuarto de los huespedes y vuelva a intentarlo')
            this.isLoading=false
          }
        else {
          this._habitacionService.sendCustomFormNotification(true);
          this.promptMessage('Exito','Habitacion eliminada con exito' )
        }
      },
      error:(error)=>{
        this.isLoading=false
        this.promptMessage('Error','No se pudo eliminar la habitacion intente de nuevo')

      },
      complete:()=>{
        this.isLoading=false
      }
    })
  }

  altaDehabitacion(){
    const modalRef=this.modalService.open(NewRoomComponent,{ size: 'lg', backdrop:'static' })
    modalRef.componentInstance.edicion=false
  }

  edit(habitacion:Habitacion){
    const imagen = this.fileList.filter((c:any)=>c.name.split('.')[0] == habitacion.Codigo)
    const modalRef=this.modalService.open(NewRoomComponent,{ size: 'lg', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacion
    modalRef.componentInstance.edicion=true
    modalRef.componentInstance.imagen=imagen[0].url
    modalRef.result.then((result)=>{
      this.habitacionesArr=[]
      //this.getHabitaciones(false);
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
        this.fileList=[]
        this.getImagenesHabitaciones()
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  promptMessage(header:string,message:string, obj?:any){
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

