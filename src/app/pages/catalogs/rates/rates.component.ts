import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Tarifas } from 'src/app/models/tarifas';
import { TarifasService } from 'src/app/services/tarifas.service';
import { EditExpressRateComponent } from './express-rates/edit-express-rate/edit-express-rate.component';
import { ExpressRatesComponent } from './express-rates/express.rates.component';
import { SpecialRatesComponent } from './special-rates/special-rates.component';


@Component({
  selector: 'app-special-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.scss']
})
export class RatesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //DOM
  isLoading: boolean;

  //Table
  displayedColumns: string[] = ['Tarifa', 'Habitacion', 'Plan', 'Politicas','Estancia','Estado','Acciones'];
  dataSource = new MatTableDataSource<any>();
  displayedColumnsEspecial: string[] = ['Tarifa', 'Habitacion', 'Plan', 'Politicas','Estancia','Estado','Acciones'];
  dataSourceEspecial = new MatTableDataSource<any>();

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  /**Models */
  options = [
    {name:'Lun', value:'0', checked:false},
    {name:'Mar', value:'1', checked:false},
    {name:'Mie', value:'2', checked:false},
    {name:'Jue', value:'3', checked:false},
    {name:'Vie', value:'4', checked:false},
    {name:'Sab', value:'5', checked:false},
    {name:'Dom', value:'6', checked:false}
  ]
  tarifaRackArr:any[]=[]
  tarifaRackCompleto:Tarifas[]=[]
  tarifaEspecialArray:Tarifas[]=[]

  /**Variables */
  closeResult:string

  private subscriptions: Subscription[] = [];

  constructor(
    public fb : FormBuilder,
    public tarifasService:TarifasService,
    public modalService:NgbModal,
  ) { 
    const sb =this.tarifasService.getNotification().subscribe(data=>{
      if(data)
      {
        this.dataSourceEspecial.data=[]
        this.getTarifasRack();
        this.getTarifas();
      }
    });
    this.subscriptions.push(sb)
  }

  ngOnInit(): void {

    this.getTarifasRack();
    this.getTarifas();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getTarifasRack(){
    this.tarifaRackArr=[]
    this.dataSource.data=[]
    this.tarifaRackCompleto=[]
    this.tarifasService.getTarifaRack().subscribe(
      (value)=>{
        this.tarifaRackArr=[]
        if(value){
          this.tarifaRackCompleto=value
          for(let e=0;e<value.length;e++){
            for(let i=0;i<value[e].Habitacion.length;i++){
              let tarifario = {
                  Tarifa:value[e].Tarifa,
                  Habitacion:value[e].Habitacion[i],
                  Llegada:value[e].Llegada,
                  Salida:value[e].Salida,
                  Plan:value[e].Plan,
                  Politicas:value[e].Politicas,
                  EstanciaMinima:value[e].EstanciaMinima,
                  EstanciaMaxima:value[e].EstanciaMaxima,
                  TarifaRack:value[e].TarifaRack,
                  TarifaXAdulto:value[e].TarifaXAdulto,
                  TarifaXNino:value[e].TarifaXNino,
                  Dias:value[e].Dias,
                  Estado:value[e].Estado==true ? 'Activa' : 'No Activa'
              }
              this.tarifaRackArr.push(tarifario)
          }
        
          }
          this.dataSource.data=this.tarifaRackArr
          // this.tarifaRackArrOnly=(value)
        }

      },
      (error)=>{

      })
  }

  getTarifas(){
    this.dataSourceEspecial.data=[]
    this.tarifaEspecialArray=[]
    this.tarifaRackCompleto=[]
    this.tarifasService.getAll().subscribe(
      (value)=>{
        for(let i=0;i<value.length;i++){
          if(value[i].Tarifa!='Tarifa Estandar'){
            this.tarifaEspecialArray.push(value[i])
          }
        }
        /*Borra Duplicados*/
        var borraDuplicados = this.tarifaEspecialArray.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.Tarifa === value.Tarifa
          ))
      )
      /** */
        this.dataSourceEspecial.data=borraDuplicados
      },
      (error)=>{

      })
  }

  promtDelete(habitacion:string){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Advertencia'
        modalRef.componentInstance.mensaje='Estas seguro que deseas eliminar la tarifa para la habitación '+habitacion+''          
        modalRef.result.then((result) => {
          if(result=='Aceptar')        
          {
            this.deleteTarifaRack(habitacion)
            this.tarifaEspecialArray=[]
          } 
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });

  }

  promtDeleteEspecial(element:Tarifas){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    modalRef.componentInstance.alertHeader = 'Advertencia'
    modalRef.componentInstance.mensaje='Estas seguro que deseas eliminar la "'+element.Tarifa+'"'          
    modalRef.result.then((result) => {
      if(result=='Aceptar')        
      {
        this.deleteTarifaRackEspecial(element)
        this.tarifaEspecialArray=[]
      } 
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  deleteTarifaRack(habitacion:string){
    let habitaciones
    let habitacionesArr:string[] =[]
    let tarifaRackArrOnly:any

    for(let i=0;i<this.tarifaRackCompleto.length;i++){
      for(let x=0;x<this.tarifaRackCompleto[i].Habitacion.length;x++){
        if(this.tarifaRackCompleto[i].Habitacion[x]==habitacion){
          if(this.tarifaRackCompleto[i].Habitacion.length==1){
            habitaciones = this.tarifaRackArr.filter(value => value.Habitacion == habitacion)
            habitacionesArr.push(habitacion)

             tarifaRackArrOnly = {
              Tarifa:habitaciones[0].Tarifa,
              Habitacion:this.tarifaRackCompleto[i].Habitacion,
              Llegada:habitaciones[0].Llegada,
              Salida:habitaciones[0].Salida,
              Plan:habitaciones[0].Plan,
              Politicas:habitaciones[0].Politicas,
              EstanciaMinima:habitaciones[0].EstanciaMinima,
              EstanciaMaxima:habitaciones[0].EstanciaMaxima,
              TarifaRack:habitaciones[0].TarifaRack,
              Tarifa1Persona:habitaciones[0].Tarifa1Persona,
              Tarifa2Persona:habitaciones[0].Tarifa2Persona,
              Tarifa3Persona:habitaciones[0].Tarifa3Persona,
              Tarifa4Persona:habitaciones[0].Tarifa4Persona,
              Dias:this.options,
              Estado:true
            }
          }else{
            habitaciones = this.tarifaRackCompleto[i].Habitacion.filter(value => value != habitacion)

            tarifaRackArrOnly = {
              Tarifa:this.tarifaRackCompleto[i].Tarifa,
              Habitacion:habitaciones,
              Llegada:this.tarifaRackCompleto[i].Llegada,
              Salida:this.tarifaRackCompleto[i].Salida,
              Plan:this.tarifaRackCompleto[i].Plan,
              Politicas:this.tarifaRackCompleto[i].Politicas,
              EstanciaMinima:this.tarifaRackCompleto[i].EstanciaMinima,
              EstanciaMaxima:this.tarifaRackCompleto[i].EstanciaMaxima,
              TarifaRack:this.tarifaRackCompleto[i].TarifaRack,
              TarifaXAdulto:this.tarifaRackCompleto[i].TarifaXAdulto,
              TarifaXNino:this.tarifaRackCompleto[i].TarifaXNino,
              Dias:this.options,
              Estado:true
          }
        }
      }
    }
  }
    // let habitaciones = this.tarifaRackArr.filter(value => value.Habitacion == habitacion)
    

    this.tarifasService.deleteTarifas(tarifaRackArrOnly).subscribe(
      (value)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Tarifa Eliminada con éxito'          
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.tarifasService.sendNotification(true);
        
      },
      (error)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje='No se pudo eliminar la tarifa intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
      })
    
  }

  deleteTarifaRackEspecial(element:Tarifas){
    this.tarifasService.deleteTarifaEspecial(element).subscribe(
      (value)=>{
        this.getTarifas();
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Tarifa Eliminada con éxito'          
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.tarifasService.sendNotification(true);
        
      },
      (error)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje='No se pudo eliminar la tarifa intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
      })
  }

  editarTarifaExpress(row:any){
    const modalref = this.modalService.open(EditExpressRateComponent,{size:'lg',backdrop:'static'})
    modalref.componentInstance.tarifa=row
  }

  editTarifaEspecial(row:any){

  }

  nuevaTarifaExpress(){
    const modalRef = this.modalService.open(ExpressRatesComponent, { size: 'md',backdrop: 'static' });

      modalRef.result.then( () =>
      () => { }
      );
  }

  nuevaTarifaEspecial(){
    const modalRef = this.modalService.open(SpecialRatesComponent, { size: 'md',backdrop: 'static' });

      modalRef.result.then( () =>
      () => { }
      );
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
