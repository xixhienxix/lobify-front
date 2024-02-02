import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, map } from 'rxjs';
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

  getHabitaciones(reloading:boolean){
    let codigosCuarto
    let arrayUniqueByKey
    let newArray

    if(!reloading)
    {
      // this.blockedTabled=true //
    }
    if(reloading){
      this.reloading=true
    }
    const sb  =  this._habitacionService.getAll().subscribe(
      (val:Habitacion[])=>{
        
        codigosCuarto = [...new Set(val.map(item => item.Codigo))];

        arrayUniqueByKey = [...new Map(val.map(item  =>
          [item['Codigo'], item])).values()];

        newArray = arrayUniqueByKey
          .map(({_id, Amenidades, Tipos_Camas, Numero, Descripcion, Vista, Camas, Tarifa, Orden, hotel, Ninos, URL, ...keepAttrs}) => keepAttrs)

        this.dataSource.data = newArray
        
    })

    this.subscriptions.push(sb)
  }

  add(habitacion:any){
    const modalRef = this.modalService.open(NewRoomComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacion
    modalRef.componentInstance.editarHab=true
    modalRef.result.then((result) => {
      this.habitacionesArr=[]
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });  
  }

  delete(habitacion:any){
    console.log(habitacion)
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

  getImagenesHabitaciones(){
    this.uploadService.getAllFiles().snapshotChanges().pipe(
      map((changes:any) =>
        changes.map((c:any) => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe((fileUploads:any) => {
      this.fileList = fileUploads;
    });
  }

  popDelete(habitacion:Habitacion){
    const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertsHeader='Advertencia'
        modalRef.componentInstance.mensaje='Esta seguro que quiere eliminar esta habitación'

        modalRef.result.then((result) => {
          if(result=='Aceptar')
          {
            this.isLoading=true
            const sb = this._habitacionService.searchRoom(habitacion).subscribe(
              (value)=>{
                if(value.length!=0){
                  const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
                        modalRef.componentInstance.alertsHeader='Error'
                        modalRef.componentInstance.mensaje='Existen reservaciones que fueron asignadas a esta habitacion aun asi desea eliminarla?'
                        modalRef.result.then((result) => {
                          if(result=='Aceptar') {
                            this.deletehab(habitacion._id)
                          }else
                          this.closeResult = `Closed with: ${result}`;
                          }, (reason) => {
                              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                          });
                          this.isLoading=false
                }else{
                  this.deletehab(habitacion._id)
                }
              })
          }
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
  }

  deletehab(_id:string){
    this.isLoading=true
    const sd =  this._habitacionService.deleteHabitacion(_id).subscribe(
      (value:any)=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Habitación Eliminada con éxito'
        modalRef.result.then((result) => {
          this.habitacionesArr=[]
          //this.getHabitaciones(false);
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this._habitacionService.fetch();
      },
      (error:any)=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='No se pudo Eliminar la habitación intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
      })
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

