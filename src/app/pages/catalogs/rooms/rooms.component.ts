import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit{


    /**Table */
    dataSource = new MatTableDataSource<any[]>();
    displayedColumns = ["Nombre de la habitación",
    "Codigo de la Habitación",
    "Tipo",
    "Capacidad",
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

    this._habitacionService.fetch()
    //this.getHabitaciones(false)

    const sb = this._habitacionService.isLoading$.subscribe((res) => {
      this.isLoading = res
    });
    this.subscriptions.push(sb);

    this.grouping = this._habitacionService.grouping;
    this.paginator = this._habitacionService.paginator;
    this.sorting = this._habitacionService.sorting;
    this.sorting.column = 'Codigo'
    this.sorting.direction = 'asc'
    
    this.isLoading=false
  }

  getHabitaciones(){

  }
  // getHabitaciones(reloading:boolean){
    
  //   if(!reloading)
  //   {
  //     // this.blockedTabled=true //
  //   }
  //   if(reloading){
  //     this.reloading=true
  //   }

  //   const sb = this._habitacionService.getAll().subscribe(
  //     (value)=>{
  //         if(Object.keys(habitaciones).length !== 0){
  //           this.habitacionesporCodigo = habitaciones.reduce(function (r, a) {
  //             r[a.Codigo] = r[a.Codigo] || [];
  //             r[a.Codigo].push(a);
  //             return r;
  //         }, Object.create(null));
          

  //         this.habitacionesArr=[] // limpia array de habitaciones


  //         for(let i=0;i<value.length;i++){
  //           let inventario = 0
  //           for(let g=0;g<habitaciones.length;g++)
  //           {
  //             if(value[i].toString()==habitaciones[g].Codigo){
  //               inventario++
  //             }
  //           }

  //           let array = {
  //             Codigo:'',
  //             Capacidad:1,
  //             Tipo:'',
  //             Inventario:1,
  //             Amenidades:[],
  //             Camas:1,
  //             Descripcion:'',
  //             Personas:1,
  //             Personas_Extra:1,
  //             Vista:'',
  //             Tipos_Camas:[],
  //             Orden:1
  //           }
  //             array.Codigo=this.habitacionesporCodigo[value[i].toString()][0].Codigo
  //             array.Capacidad = this.habitacionesporCodigo[value[i].toString()][0].Personas
  //             array.Amenidades = this.habitacionesporCodigo[value[i].toString()][0].Amenidades
  //             array.Camas = this.habitacionesporCodigo[value[i].toString()][0].Camas
  //             array.Tipo = this.habitacionesporCodigo[value[i].toString()][0].Tipo
  //             array.Inventario =inventario
  //             array.Descripcion = this.habitacionesporCodigo[value[i].toString()][0].Descripcion
  //             array.Personas = this.habitacionesporCodigo[value[i].toString()][0].Personas
  //             array.Personas_Extra = this.habitacionesporCodigo[value[i].toString()][0].Personas_Extra
  //             array.Vista=  this.habitacionesporCodigo[value[i].toString()][0].Vista
  //             array.Tipos_Camas=  this.habitacionesporCodigo[value[i].toString()][0].Tipos_Camas
  //             array.Orden=  this.habitacionesporCodigo[value[i].toString()][0].Orden

  //             this.habitacionesArr.push(array)
  //             this.blockedTabled=false
  //             this.reloading=false
  //         }
  //         this.dataSource.data=this.habitacionesArr
  //       }
        

  //       this.subscriptions.push(sb)
  //   })

  //   this.subscriptions.push(sb)
  // }

  add(habitacion:any){
    const modalRef = this.modalService.open(NewRoomComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacion
    modalRef.result.then((result) => {
      this.habitacionesArr=[]
      // this.getHabitaciones(false);
      this._habitacionService.fetch();
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });  
  }

  altaDehabitacion(){
    const modalRef=this.modalService.open(RoomsComponent,{ size: 'lg', backdrop:'static' })
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

    // sorting
    sort(column: string) {
      const sorting = this.sorting;
      const isActiveColumn = sorting.column === column;
      if (!isActiveColumn) {
        sorting.column = column;
        sorting.direction = 'desc';
      } else {
        sorting.direction = sorting.direction === 'desc' ? 'asc' : 'desc';
      }
      this._habitacionService.patchState({ sorting });
    }

      // pagination
    paginate(paginator: PaginatorState) {
      this._habitacionService.patchState({ paginator });
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

