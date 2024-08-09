import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { HuespedService } from 'src/app/services/huesped.service';


@Component({
  selector: 'app-edo-cuenta-component',
  templateUrl: './edoCuenta.component.html',
  styleUrls: ['./edoCuenta.component.scss']
})
export class EdoCuentaComponent implements OnInit, OnDestroy {
  /**Subscription */
  subscription:Subscription[]=[]
  /**Models */
  alojamientoPorNoche:any[]=[]
  estadoDeCuenta:edoCuenta[]=[]
  edoCuentaActivos:edoCuenta[]=[]
  edoCuentaCancelados:edoCuenta[]=[]
  edoCuentaDevoluciones:edoCuenta[]=[]
  edoCuentaAlojamientosActivos:any[]=[]
  edoCuentaServiciosExtra:any[]=[]
  edoCuentaDescuentosLista:any[]=[]
  edoCuentaAbonosLista:any[]=[]

  closeResult: string;
  subTotalAlojamiento:string;
  totalCalculado:number
  subTotalServiciosExtra:number=0;
  impuestoSobreHospedaje:number=0;
  iva:number=0;
  totalimpuestos:number=0;
  totalDescuentos:number=0;
  totalAbonos:number=0;
  totalCargos:number=0;

  /**DOMM */
  inputDisabled:boolean =false
  @Input() currentEdoCuenta:edoCuenta[];
  @Input() currentHuesped:Huesped;

  @Output() honAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();


  constructor(
    public _huespedService:HuespedService,
    public _edoCuentaService:Edo_Cuenta_Service,
    public modalService:NgbModal,
    public i18n: NgbDatepickerI18n,
    public divisasService:DivisasService
    
  ) {
    const sb = this._edoCuentaService.getNotification().subscribe(data=>{
      if(data)
      {
        this.getEdoCuenta();
      }
    });
    this.subscription.push(sb)
   }

  ngOnInit(): void {


    this.currentHuesped.habitacion
    this._edoCuentaService.currentCuentaValue
    this.getEdoCuenta()

  }


  getEdoCuenta(){
    this.totalCargos=0;
    this.totalDescuentos=0;
    this.totalAbonos=0;
    this.subTotalServiciosExtra=0;
    this.iva=0;
    this.estadoDeCuenta=[]
    this.edoCuentaActivos=[]
    this.edoCuentaCancelados=[]
    this.edoCuentaDevoluciones=[]
    this.alojamientoPorNoche=[]

    this.edoCuentaAlojamientosActivos=[]
    this.edoCuentaServiciosExtra=[]
    this.edoCuentaDescuentosLista=[]
    this.edoCuentaAbonosLista=[]

    this.currentEdoCuenta.map((item)=>{

          //Totales
          if(item.Cargo!=0 && item.Estatus=='Activo'){ 
            this.totalCargos+=item.Cargo!
          } 
          if(item.Forma_de_Pago=='Descuento' && item.Estatus=='Activo'){ 
            this.totalDescuentos+=item.Abono!
          }
          if(item.Abono!=0 && item.Estatus=='Activo' && item.Forma_de_Pago!='Descuento'){ 
            this.totalAbonos+=item.Abono! 
          }
          //

          if(item.Estatus=='Activo'){ 
            let edoCuentaAlojamientoTemp
            let fromDate

            var anoLlegada = parseInt(this.currentHuesped.llegada.split("/")[2])
            var mesLlegada = parseInt(this.currentHuesped.llegada.split("/")[1])
            var diaLlegada = parseInt(this.currentHuesped.llegada.split("/")[0])

            fromDate = new Date(anoLlegada,mesLlegada-1,diaLlegada)

            if(item.Descripcion=='HOSPEDAJE'){
               fromDate = new Date(anoLlegada,mesLlegada-1,diaLlegada)

              for (let y=0; y<this.currentHuesped.noches; y++){

                let fullFechaSalida=new Date(fromDate).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fromDate).getUTCMonth()+1)+" del "+new Date(fromDate).getFullYear()
                edoCuentaAlojamientoTemp = {

                  _id:item._id,
                  Folio:item.Folio,
                  Referencia:item.Referencia,
                  Forma_de_Pago:item.Forma_de_Pago,
                  Fecha:fullFechaSalida,
                  Fecha_Cancelado:item.Fecha_Cancelado,
                  Descripcion:item.Descripcion,
                  Cantidad:item.Cantidad,
                  Cargo:item.Cargo!/this.currentHuesped.noches,
                  Abono:item.Abono,
                  Total:item.Total,
                  Estatus:item.Estatus,
                  Autorizo:item.Autorizo
                }

                this.impuestoSobreHospedaje = item.Total!*3/100
                this.edoCuentaAlojamientosActivos.push(edoCuentaAlojamientoTemp)
                this.subTotalAlojamiento = item.Cargo!.toLocaleString()

                // fechaIncial.setDate(fechaIncial.getDate() + 1);
                fromDate.setDate(fromDate.getDate() + 1);
              }
            }
            if(item.Descripcion!='HOSPEDAJE'&& item.Cargo!=0){
             
              let fechaLarga = new Date(anoLlegada,mesLlegada-1,diaLlegada)
              let fullFechaServicio=new Date(fechaLarga).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fechaLarga).getUTCMonth()+1)+" del "+new Date(fechaLarga).getFullYear()
              let edoCuentaserviciosExtraTemp = {

                _id:item._id,
                Folio:item.Folio,
                Referencia:item.Referencia,
                Forma_de_Pago:item.Forma_de_Pago,
                Fecha:fullFechaServicio,
                Fecha_Cancelado:item.Fecha_Cancelado,
                Descripcion:item.Descripcion,
                Cantidad:item.Cantidad,
                Cargo:item.Cargo,
                Abono:item.Abono,
                Total:item.Total,
                Estatus:item.Estatus,
                Autorizo:item.Autorizo
              }

              this.edoCuentaServiciosExtra.push(edoCuentaserviciosExtraTemp)
              this.subTotalServiciosExtra += item.Cargo!
            }
            if(item.Forma_de_Pago=='Descuento'){
            
              let fechaLargaDesc = new Date(anoLlegada,mesLlegada-1,diaLlegada)
              let fullFechaDescuento=new Date(fechaLargaDesc).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fechaLargaDesc).getUTCMonth()+1)+" del "+new Date(fechaLargaDesc).getFullYear()
              let edoCuentaDescuentos = {

                _id:item._id,
                Folio:item.Folio,
                Referencia:item.Referencia,
                Forma_de_Pago:item.Forma_de_Pago,
                Fecha:fullFechaDescuento,
                Fecha_Cancelado:item.Fecha_Cancelado,
                Descripcion:item.Descripcion,
                Cantidad:item.Cantidad,
                Cargo:item.Cargo,
                Abono:item.Abono,
                Total:item.Total,
                Estatus:item.Estatus,
                Autorizo:item.Autorizo
              }

              this.edoCuentaDescuentosLista.push(edoCuentaDescuentos)
            }

            if(item.Abono!=0 && item.Forma_de_Pago!='Descuento'){
              let fechaLargaAbonos = new Date(anoLlegada,mesLlegada-1,diaLlegada)
              let fullFechaAbonos=new Date(fechaLargaAbonos).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fechaLargaAbonos).getUTCMonth()+1)+" del "+new Date(fechaLargaAbonos).getFullYear()
              let edoCuentaAbonos = {

                _id:item._id,
                Folio:item.Folio,
                Referencia:item.Referencia,
                Forma_de_Pago:item.Forma_de_Pago,
                Fecha:fullFechaAbonos,
                Fecha_Cancelado:item.Fecha_Cancelado,
                Descripcion:item.Descripcion,
                Cantidad:item.Cantidad,
                Cargo:item.Cargo,
                Abono:item.Abono,
                Total:item.Total,
                Estatus:item.Estatus,
                Autorizo:item.Autorizo
              }

              this.edoCuentaAbonosLista.push(edoCuentaAbonos)
              // this.totalAbonos+=item.Abono
            }
            this.edoCuentaActivos.push(item) 
          }
          if(item.Estatus=='Cancelado')
          { this.edoCuentaCancelados.push(item) }
          if(item.Estatus=='Devolucion')
          { this.edoCuentaDevoluciones.push(item) }
          this.estadoDeCuenta.push(item) 
        
      });

      let totalCargos=0;
          let totalAbonos=0;

          for(let i=0;i<this.edoCuentaActivos.length;i++){
              totalCargos = totalCargos + this.edoCuentaActivos[i].Cargo!
              totalAbonos = totalAbonos + this.edoCuentaActivos[i].Abono!
          }

          this.totalCalculado=totalCargos-totalAbonos
          this.iva = this.subTotalServiciosExtra*16/100
          this.totalimpuestos=this.iva+(this.impuestoSobreHospedaje)
    }

    /*Modal HELPERS*/

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

    ngOnDestroy(): void {
      this.subscription.forEach(sb=>sb.unsubscribe())
    }

}
