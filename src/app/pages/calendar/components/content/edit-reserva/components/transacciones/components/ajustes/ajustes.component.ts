import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import { edoCuenta } from 'src/app/models/edoCuenta.model';
import { Huesped } from 'src/app/models/huesped.model';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';

export interface Transacciones {
  Fecha: Date;
  Descripcion: string;
  Forma_De_Pago: string;
  Cantidad: number;
  Cargo:number;
  Abono:number
}

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.scss']
})
export class AjustesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['Fecha', 'Descripcion','Forma_De_Pago','Cantidad','Cargo','Abono'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  /**OBSERVABLE */
  // edoCuenta$:Observable<edoCuenta[]>
  /**Subscription */
  subscription:Subscription[]=[]

  closeResult:string;
  alertHeader:string;
  totalCalculado:number=0

  /*MODELS*/
  estadoDeCuenta:edoCuenta[]=[];
  transacciones:Transacciones[]=[]
  ajustes:Transacciones[]=[]
  huesped:Huesped;
  formasDePago:string[]=['Ajuste','Efectivo']

  /*Table*/
  clickedRows = new Set<Transacciones>();
  dataSource: MatTableDataSource<Transacciones>;

  /*AjustesTable*/
  ajustesDataSource: MatTableDataSource<Transacciones>;

  /*FORM*/
  formGroup:FormGroup

  /*LOADINGS*/
  submitted:boolean=false
  isLoading:boolean=false


  constructor(
    
    private edoCuentaService:Edo_Cuenta_Service,
    private modalService : NgbModal,
    private fb : FormBuilder,
    private modal : NgbActiveModal,
    public divisasService:DivisasService
    ) { 

      // this.edoCuentaService.edoCuentaSubject.subscribe(
      //   (result)=>
      //   {
      //     for(let i =0;i<result.length;i++){
      //       this.transacciones[i] = {
      //         Fecha:result[i].Fecha,
      //         Descripcion:result[i].Descripcion,
      //         Forma_De_Pago:result[i].Forma_de_Pago,
      //         Cantidad:result[i].Cantidad,
      //         Cargo:result[i].Cargo,
      //         Abono:result[i].Abono,
      //       }
      //     }

      //     this.estadoDeCuenta=result
      //     this.dataSource = new MatTableDataSource(this.transacciones);
      //   },
      //   (err)=>{
      //     if (err)
      //     {
      //       const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      //       modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
      //       modalRef.componentInstance.alertHeader='Error'
      //       modalRef.result.then((result) => {
      //         this.closeResult = `Closed with: ${result}`;
      //         }, (reason) => {
      //             this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      //         });
      //         setTimeout(() => {
      //           modalRef.close('Close click');
      //         },4000)
      //     }
      //   }
      //   )
    }

  ngOnInit(): void {
    this.initForm();
    this.creaTabla();
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  creaTabla(){

    const sb = this.edoCuentaService.getCuentas(this.huesped.folio).subscribe(
      (result)=>{
        
        for(let i =0;i<result.length;i++){
          this.transacciones[i] = {
            Fecha:result[i].Fecha,
            Descripcion:result[i].Descripcion,
            Forma_De_Pago:result[i].Forma_de_Pago,
            Cantidad:result[i].Cantidad,
            Cargo:result[i].Cargo!,
            Abono:result[i].Abono!,
          }
        }
        this.edoCuentaService.edoCuentaSubject.next(result)
        this.estadoDeCuenta=result
        this.dataSource = new MatTableDataSource(this.transacciones);   
      },
      (err)=>{
        if (err)
        {
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
          modalRef.componentInstance.alertHeader='Error'
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
        }
      }
    )
    this.subscription.push(sb)
  }

  initForm(){
    this.formGroup = this.fb.group({
      monto:['',Validators.required],
      pago:['',Validators.required],
      descripcion:['',Validators.required],
      tipo:['',Validators.required]
    })
  }

  get f() {return this.formGroup.controls}

  getTotal(){
    let abonos = this.estadoDeCuenta.map(t => t.Abono).reduce((acc, value) => acc! + value!, 0);
    let cargos = this.estadoDeCuenta.map(t => t.Cargo).reduce((acc, value) => acc! + value!, 0);
    return cargos!-abonos!
  }

  getTotalAjustes(){
    let abonos = this.ajustes.map(t => t.Abono).reduce((acc, value) => acc + value, 0);
    let cargos = this.ajustes.map(t => t.Cargo).reduce((acc, value) => acc + value, 0);
    return cargos-abonos
  }
  

  llenarAjustesTable(value:Transacciones){


    if(this.ajustes.length==0)
    {
      this.ajustes.push(value)
    }else
    {
      this.ajustes=[]
      this.ajustes.push(value)
    }
    this.ajustesDataSource = new MatTableDataSource(this.ajustes);

  }

onSubmit()
{
  if(this.formGroup.invalid)
    {
      this.submitted=true
      return;
    }

    this.isLoading=true
    
    let pago:edoCuenta ={
        Folio:this.huesped.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:'',
        Forma_de_Pago:'',
        Cantidad:1,
        Abono:0,
        Cargo:0,
        Estatus:'Ajuste'
    };

    if(this.f.tipo.value=='Ajuste')
    {
       pago = {

        Folio:this.huesped.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:this.f.descripcion.value,
        Forma_de_Pago:this.f.pago.value,
        Cantidad:1,
        Abono:this.f.monto.value,
        Cargo:0,
        Estatus:'Ajuste'
        
      }
    }else if(this.f.tipo.value=='Devolucion')
    {
      pago = {

        Folio:this.huesped.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:this.f.descripcion.value,
        Forma_de_Pago:this.f.pago.value,
        Cantidad:1,
        Abono:0,
        Cargo:this.f.monto.value,
        Estatus:'Devolucion'

      }
    }

    

    const sb = this.edoCuentaService.agregarPago(pago).subscribe(
      (result)=>{
        
        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader='Exito'
        modalRef.componentInstance.mensaje=this.f.tipo.value +' guardado con exito!'        
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)

          this.isLoading=false
          this.formGroup.reset();
          this.ajustes=[]
          this.estadoDeCuenta=[]
          this.transacciones=[]

          this.creaTabla();


      },
      (err)=>
      {
        if(err)
        {
          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje='No se pudo Guardar el Pago Intente Nuevamente'
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
              
          this.isLoading=false
      
        }
      },
      ()=>{//FINALLY
      }
      )
      this.subscription.push(sb)
  }
 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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


  
  closeModal(){
      this.modal.close();
  }
  /*FORM HELPERS*/
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sb=>sb.unsubscribe)
  }
}
