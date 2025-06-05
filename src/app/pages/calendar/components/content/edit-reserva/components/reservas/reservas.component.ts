/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbCalendar, NgbDate, NgbDatepickerI18n, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import {DateTime} from 'luxon'
import { Huesped } from 'src/app/models/huesped.model';
import { Adicional } from 'src/app/models/adicional.model';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { Promesa } from 'src/app/pages/calendar/_models/promesas.model';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { PromesaService } from 'src/app/services/promesas.service';
import { edoCuenta } from 'src/app/models/edoCuenta.model';

@Component({
  selector: 'app-reservas-component',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss']
})
export class ReservasComponent implements OnInit {
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('pregunta') preguntaPrevia: null;
  
  @Input() currentHuesped:Huesped;
  @Input() adicionalSubject:Subject<Adicional[]>
  @Input() promesasDisplay:boolean=false; 
  @Input() changing: Subject<Promesa[]>;
  @Input() onSuccessResponse: Subject<boolean>;

  @Output() onGetAdicionales: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetPromesas: EventEmitter<string> = new EventEmitter();
  @Output() onDeletePromesas: EventEmitter<string> = new EventEmitter();
  @Output() onUpdateEstatusHuesped: EventEmitter<Huesped> = new EventEmitter();
  @Output() onAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();
  @Output() onGuardarPromesa: EventEmitter<any> = new EventEmitter();
  @Output() onAgregarPago: EventEmitter<edoCuenta> = new EventEmitter();
  @Output() honEstatusAplicado: EventEmitter<Huesped> = new EventEmitter();
  /**INDEX */
  idPromesa:''

/**FORMS */
  formGroup:FormGroup
  formGroupPromesa:FormGroup
  serviciosAdicionaledForm:FormGroup
  thirdForm:FormGroup
  forthForm:FormGroup

  /*Date Variables*/
  fullFechaSalida:string
  fullFechaLlegada:string
  fromDate: DateTime;
  toDate: DateTime;
  comparadorInicial:DateTime
  comparadorFinal:DateTime
  fechaFinalBloqueo:string=''
  fechaInicialBloqueo:string
  noches:number;
  closeResult:string;
  minDate:NgbDateStruct;
  today:DateTime=DateTime.now();

  /*Models*/
  adicionalArray:Adicional[]=[];
  estatusArray:Estatus[]=[];
  promesasPagoList:any[]=[];
  formasDePago:string[]=['Efectivo','Tarjeta de Credito','Tarjeta de Debito', 'Cortesía']
  private subscriptions: Subscription[] = [];
  clickedRow = new Set<any>()
  clickedRows = new Set<any>();
  model:NgbDateStruct;

  subscription:Subscription[]=[]

  /*TABLE*/
  dataSource: MatTableDataSource<any>;

  /*Diseño Dinamico*/
  changeStyleHidden:string = 'display:none'
  setLabel:string="label label-lg label-light-primary label-inline"
  expired:boolean=false;
  isLoading:boolean=false;
  todayString:string;
  pagoManual:boolean=false;
  formadePago:string='Efectivo';
  inputDisabled:boolean=false

  constructor(
    public i18n: NgbDatepickerI18n,
    public fb : FormBuilder,
    public modalService: NgbModal,
    private _promesasService: PromesaService
  ) {  
  }

  ngOnInit(): void {
    this.fullFechaLlegada = new Date(this.currentHuesped.llegada).toDateString()
    this.fullFechaSalida = new Date(this.currentHuesped.salida).toDateString()
    this.currentHuesped.creada = new Date(this.currentHuesped.creada).toDateString()
    
    this.changing.subscribe(
        {
            next:(newDataSource) => { 
                this.dataSource = new MatTableDataSource(newDataSource);   
                this.dataSource.sort = this.sort;
            }
        });

    this.onSuccessResponse.subscribe({
        next:(val)=>{
            if(val){
            this.promesasDisplay=true
            this.formGroupPromesa.reset();
            this.promesasPagoList=[]
            this.onGetPromesas.emit(this.currentHuesped.folio);
            }
        }
    })

    if(this.currentHuesped.estatus=='Reserva Cancelada'||this.currentHuesped.estatus=='No Show'||this.currentHuesped.estatus=='Check-Out')
    {this.inputDisabled=true}

    this.adicionalSubject.subscribe({
        next:(val)=>{
            this.adicionalArray = [...val]
        },
        error:(error)=>{
            this.promesasDisplay=false
        }
    })

    // this.getPromesa();
    this.loadForm();

  }

    eliminarPromesa(_id:any){
      this.isLoading=true
      this.onDeletePromesas.emit(_id);
    }

    // getPromesa(){
    //   this.onGetPromesas.emit(this.currentHuesped.folio);
    // }
    
    
    formatDate(fecha:any){
      this.todayString= fecha.day+" de "+this.i18n.getMonthFullName(fecha.month)+" del "+fecha.year
      }


  loadForm() {
    const intialDate = new Date(this.currentHuesped.llegada);
    const endDate = new Date(this.currentHuesped.salida);

    let Difference_In_Time = intialDate.getTime() - endDate.getTime();
    this.noches = Math.floor(Difference_In_Time / (1000 * 3600 * 24));
    // this.noches = this.toDate.diff(this.fromDate, ["days"])

    // this.noches=-parseInt((this.currentHuesped.llegada.toString()).split("/")[0])+parseInt((this.currentHuesped.salida.toString()).split("/")[0])

    this.formGroupPromesa = this.fb.group({
      promesaPago:['',Validators.required],
      fechaPromesaPago : [this.fechaFinalBloqueo,Validators.required]
    })

    this.serviciosAdicionaledForm = this.fb.group({
      notas:[''],
      // adicional:['']
    })

    this.thirdForm = this.fb.group({
      pagoManualInput:['',Validators.compose([Validators.required,Validators.pattern("^[0-9]*$")])],
      // adicional:['']
    })

    this.forthForm = this.fb.group({
      pago:['Efectivo',Validators.required]

    })
  }

  get promesa (){
    return this.formGroupPromesa.controls
  }
  get getServiciosAdicionales (){
    return this.serviciosAdicionaledForm.controls
  }
  get getThirdForm (){
    return this.thirdForm.controls
  }
  get getforthForm (){
    return this.forthForm.controls
  }

  guardarAdicionales(){
    this.isLoading=true

    this.currentHuesped.notas=this.getServiciosAdicionales.notas.value
    this.onUpdateEstatusHuesped.emit(this.currentHuesped) 
  }

  guardarPromesa(){
    if(this.formGroupPromesa.invalid){  

      this.onAlertMessage.emit({tittle:'Error', message:'Seleccione una Fecha' })
      this.formGroupPromesa.markAllAsTouched();

      return
    }
    let estatus='Vigente'
    this.onGuardarPromesa.emit({folio:this.currentHuesped.folio,fechaPromesaPago:this.promesa.fechaPromesaPago.value,promesaPago:this.promesa.promesaPago.value,estatus});
    this._promesasService.getPromesas(this.currentHuesped.folio).subscribe({
      next:()=>{
        this.promesasDisplay=false;
      },
      error:()=>{
        this.onAlertMessage.emit({tittle:'Error', message:'No se pudieron actualizar las refrescas, cierre la pantalla y vuelva a intentar'});
      }
    });
  }

  togglePromesas(folio:string){
    if(this.promesasDisplay==false)
    {this.promesasDisplay=true}
    else if(this.promesasDisplay==true){
      this.promesasDisplay=false
    }
    this.onGetPromesas.emit(folio);
  }

  getAdicionales(): void {
    this.onGetAdicionales.emit(true);
  }


  setEstatus(value:any): void {

    for (let i=0;i<this.estatusArray.length;i++)
    {
      if(value==this.estatusArray[i].id)
      {
        this.currentHuesped.estatus = this.estatusArray[i].estatus
        this.setLabel= this.estatusArray[i].color
      }
    }
  }

  estatusAplicado(row:any){
    if(row.Aplicado===false){
      row.Aplicado=true;
      const modalRef = this.modalService.open(this.preguntaPrevia,{ size: 'sm', backdrop:'static' })
      modalRef.result.then( (value) =>{
        this._promesasService.updatePromesaEstatus(row._id,row.Estatus).subscribe({
          next:(item)=>{
            if(this.currentHuesped.estatus=='Reserva Sin Pago'||this.currentHuesped.estatus=='Esperando Deposito')
              {
                this.currentHuesped.estatus='Deposito Realizado'
              }
              this.honEstatusAplicado.emit(this.currentHuesped);
          }
        })

        let  pago = {
            _id : row._id,
            Fecha:row.Fecha,
            Cantidad:this.getThirdForm.pagoManualInput.value,
            Estatus:'Pago Hecho',
            Aplicado : true,
            Forma_De_Pago : this.getforthForm.pago.value
        }
        this.idPromesa=row._id
        this.aplicarPromesa(pago)
      }
    );
    }else if (row.Aplicado==true){
      this.onAlertMessage.emit({tittle:'Error', message:'Este pago ya fue Aplicado'})    
    }
  }

  aplicarPromesa(row:any){
    let pago : edoCuenta

    const dia = parseInt(row.Fecha.toString().split('/')[1])
    const mes = parseInt(row.Fecha.toString().split('/')[2])
    const ano = parseInt(row.Fecha.toString().split('/')[0])
    // const fechaPromesa = new Date(this.today.year,this.today.month,this.today.day)
    let fullFecha = this.today.day + " de " + this.i18n.getMonthFullName(this.today.month) + " del " + this.today.year.toString()

    pago = {

      Folio:this.currentHuesped.folio,
      Fecha:new Date(),
      Referencia:'Anticipo',
      Descripcion:'Promesa de Pago: ' + fullFecha,
      Forma_de_Pago: row.Forma_De_Pago,
      Cantidad:1,
      Cargo:0,
      Estatus:'Activo',
      Abono:row.Cantidad
    }

    this.onAgregarPago.emit(pago);
  }

  calculateNights(){
    const llegada = DateTime.fromISO(this.currentHuesped.llegada).startOf('day');
    const salida  = DateTime.fromISO(this.currentHuesped.salida).startOf('day');

    // Calculate the difference in days
    const days = salida.diff(llegada, 'days').days; 

    return Math.floor(days);
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


  isControlValid(controlName: string): boolean {
    const control = this.formGroupPromesa.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroupPromesa.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }
//ThirdsForm
isControlValidThird(controlName: string): boolean {
  const control = this.thirdForm.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isControlInvalidThird(controlName: string): boolean {
  const control = this.thirdForm.controls[controlName];

  return control.invalid && (control.dirty || control.touched);
}

controlHasErrorThird(validation:any, controlName:string): boolean {
  const control = this.thirdForm.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}


  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}