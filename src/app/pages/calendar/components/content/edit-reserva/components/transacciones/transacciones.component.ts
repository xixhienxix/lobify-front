import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { Historico } from "src/app/models/historico.model";
import { DetalleComponent } from "./components/detalle.component";
import { Edo_Cuenta_Service } from "src/app/services/edoCuenta.service";
import { Huesped } from "src/app/models/huesped.model";
import { AlertsComponent } from "src/app/_metronic/shared/alerts/alerts.component";
import { AlertsMessageInterface } from "src/app/models/message.model";
import { edoCuenta } from "src/app/models/edoCuenta.model";

@Component({
    selector: 'app-transacciones',
    templateUrl: './transacciones.component.html',
    styleUrls: ['./transacciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
  })
  export class TransaccionesComponent implements OnInit {
    cliente:Historico
    /*Listas*/
    estadoDeCuenta:edoCuenta[]=[]
    edoCuentaActivos:edoCuenta[]=[]
    edoCuentaCancelados:edoCuenta[]=[]
    edoCuentaDevoluciones:edoCuenta[]=[]
    edoCuentaCargos:edoCuenta[]=[]
    edoCuentaAbonos:edoCuenta[]=[]
    edoCuentaDescuentos:edoCuenta[]=[]
  
    /**MAT TABLE */
    dataSource = new MatTableDataSource<edoCuenta>();
    displayedColumns:string[] = ['Fecha','Concepto','F.P.','_id','Valor','Fecha_Cancelado','Cantidad']
  
    descuentoButton=true;
    totalCalculado:number=0;
    totalVigente:number=0;
    totalActivos:number=0;
    totalDescuentos:number=0;
    totalCargos:number=0;
    totalAbonos:number=0;
    totalCancelados:number=0;
    todosChecked:boolean=false;
    activosChecked:boolean=true;
    canceladosChecked:boolean=false;
    devolucionesChecked:boolean=false;
    abonosChecked:boolean=false;
    cargosChecked:boolean=false;
    descuentosChecked:boolean=false;
    closeResult: string;
  
    /**Subscription */
    subscription:Subscription[]=[]

    @Input() huesped:Huesped;
    @Input() currentEdoCuenta:edoCuenta[];

    @Output() honAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();

    constructor(    public modalService: NgbModal,
      public _edoCuentaService:Edo_Cuenta_Service
    ){
        
    }
    ngOnInit(){
        //this.cliente=this.historicoService.getCurrentClienteValue
        this.getEdoCuentaDataSource();
    }

    
  getEdoCuentaDataSource(){
    this.estadoDeCuenta=[]
    this.edoCuentaActivos=[]
    this.edoCuentaCancelados=[]
    this.edoCuentaDevoluciones=[] 
    this.edoCuentaAbonos=[]
    this.edoCuentaCargos=[]
    this.edoCuentaDescuentos=[]
    this.totalAbonos=0;
    this.totalActivos=0;
    this.totalCargos=0;
    this.totalDescuentos=0;
    this.totalCancelados=0;

    this.currentEdoCuenta.map((item)=>{
      if(item.Estatus === 'Activo'){
        this.edoCuentaActivos.push(item) 
        this.totalActivos += (item.Cargo! - item.Abono!)
      }if(item.Estatus === 'Cancelado'){
        this.edoCuentaCancelados.push(item) 
        this.totalCancelados += (item.Cargo! - item.Abono!)
      }if(item.Estatus === 'Devolucion'){
        this.edoCuentaDevoluciones.push(item) 
      }if(item.Estatus === 'Activo' && item.Cargo !== 0){
        this.edoCuentaCargos.push(item) 
        this.totalCargos += item.Cargo!
      }if(item.Abono !== 0 && item.Estatus=='Activo' && item.Forma_de_Pago !== 'Descuento'){
        this.edoCuentaAbonos.push(item)
        this.totalAbonos += item.Abono!
      }if(item.Forma_de_Pago === 'Descuento' && item.Estatus === 'Activo'){
        this.edoCuentaDescuentos.push(item) 
        this.totalDescuentos+=item.Abono!
      }
      this.estadoDeCuenta.push(item) 
    })

      this.dataSource.data = this.edoCuentaActivos

      let totalCargos=0;
      let totalAbonos=0;

      this.edoCuentaActivos.map((item)=>{
        totalCargos = totalCargos + item.Cargo!
        totalAbonos = totalAbonos + item.Abono!
      })

      this.totalCalculado=totalCargos-totalAbonos
      this.totalVigente=this.totalCalculado
  }
  

  selectedTable(event:any){
    if(event.source.id=='todos'){
      if(event.source._checked==true){
        this.dataSource.data = this.estadoDeCuenta
        this.totalCalculado=this.totalVigente

        this.todosChecked=true
        this.activosChecked=false;
        this.canceladosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false){
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
    else if(event.source.id=='cancelados'){
      if(event.source._checked==true){
        this.dataSource.data =this.edoCuentaCancelados
        this.totalCalculado=this.totalCancelados

        this.canceladosChecked=true
        this.activosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }else if (event.source._checked==false){
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }else if(event.source.id=='activos'){
      if(event.source._checked==true){
        this.dataSource.data = this.edoCuentaActivos
        this.totalCalculado=this.totalActivos

        this.activosChecked=true
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false)
      {
        
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
    else if(event.source.id=='devoluciones'){
      if(event.source._checked==true){
        this.dataSource.data = this.edoCuentaDevoluciones


        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=true;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false){
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
    else if(event.source.id=='descuentosRadio'){
      if(event.source._checked==true){
        this.dataSource.data = this.edoCuentaDescuentos
        this.totalCalculado=this.totalDescuentos

        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=true;
      }
      else if (event.source._checked==false){
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
    }
    else if(event.source.id=='abonosRadio'){
      if(event.source._checked==true){
        this.dataSource.data = this.edoCuentaAbonos
        this.totalCalculado=this.totalAbonos

        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=true;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false){
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
    }
    else if(event.source.id=='cargosRadio'){
      if(event.source._checked==true){
        this.dataSource.data = this.edoCuentaCargos
        this.totalCalculado=this.totalCargos

        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=true;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false){
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
  }

  abrirDetalle(row:any){

    const modalRef = this.modalService.open(DetalleComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.row = row
    modalRef.componentInstance.folio = this.cliente.folio
    modalRef.componentInstance.fechaCancelado = row.Fecha_Cancelado.split('T')[0];

  }
  
  getDismissReason(reason: any): string 
  {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
  }
  }