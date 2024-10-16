import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { catchError, firstValueFrom, of, Subscription } from "rxjs";
import { Historico } from "src/app/models/historico.model";
import { DetalleComponent } from "./components/detalle.component";
import { Edo_Cuenta_Service } from "src/app/services/edoCuenta.service";
import { Huesped } from "src/app/models/huesped.model";
import { AlertsComponent } from "src/app/_metronic/shared/alerts/alerts.component";
import { AlertsMessageInterface } from "src/app/models/message.model";
import { edoCuenta } from "src/app/models/edoCuenta.model";
import { MatPaginator } from "@angular/material/paginator";
import { Codigos } from "src/app/models/codigos.model";
import { DateTime } from "luxon";
import { FormGroup, FormControl, ValidatorFn, Validators, FormBuilder } from "@angular/forms";
import { CodigosService } from "src/app/services/codigos.service";
import { SuperUserComponent } from "src/app/modules/auth/components/super-user/super.user.component";
import { AjustesComponent } from "./components/ajustes/ajustes.component";
import { MatRadioChange } from "@angular/material/radio";
import { AuthService } from "src/app/modules/auth";
import { LogService } from "src/app/services/activity-logs.service";
interface IEstadoCuenta {
  estadoDeCuenta:edoCuenta[],
  edoCuentaActivos:edoCuenta[],
  edoCuentaCancelados:edoCuenta[],
  edoCuentaDevoluciones:edoCuenta[],
  edoCuentaAbonos:edoCuenta[],
  edoCuentaCargos:edoCuenta[],
  edoCuentaDescuentos:edoCuenta[],
  totalAbonos:number,
  totalActivos:number,
  totalCargos:number,
  totalDescuentos:number,
  totalCancelados:number,
  totalCalculado:number,
  totalVigente:number
}
const resetEstadoCuenta = (): IEstadoCuenta => ({
  estadoDeCuenta: [],
  edoCuentaActivos: [],
  edoCuentaCancelados: [],
  edoCuentaDevoluciones: [],
  edoCuentaAbonos: [],
  edoCuentaCargos: [],
  edoCuentaDescuentos: [],
  totalAbonos: 0,
  totalActivos: 0,
  totalCargos: 0,
  totalDescuentos: 0,
  totalCancelados: 0,
  totalCalculado: 0,
  totalVigente: 0,
});
interface StateMapping {
  data: any;
  total: number;
  checkedState: 'todosChecked' | 'activosChecked' | 'canceladosChecked' | 'devolucionesChecked' | 'descuentosChecked' | 'abonosChecked' | 'cargosChecked';
}
@Component({
    selector: 'app-transacciones',
    templateUrl: './transacciones.component.html',
    styleUrls: ['./transacciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
  })
  export class TransaccionesComponent implements OnDestroy, OnInit, OnChanges{
    @ViewChild(MatPaginator) paginator: MatPaginator;
  
    folio:number
    cliente:Historico
    currentUser:string='root'

    selectedService: boolean = true;    
    
    /*Listas*/
    codigosAbono:Codigos[]=[]
    codigosCargo:Codigos[]=[]

    estadoDeCuenta:edoCuenta[]=[]
    edoCuentaActivos:edoCuenta[]=[]
    edoCuentaCancelados:edoCuenta[]=[]
    edoCuentaDevoluciones:edoCuenta[]=[]
    edoCuentaCargos:edoCuenta[]=[]
    edoCuentaAbonos:edoCuenta[]=[]
    edoCuentaDescuentos:edoCuenta[]=[]
  
    codigoDeCargo:Codigos={
      Descripcion:'',
      Tipo:'',
      Precio : 0
    }
    /**Subscription */
    subscription:Subscription[]=[]
  
    /*Site Helpers*/
    listaEstadosCuenta:IEstadoCuenta
    nuevaSeleccion:string='Seleccione un Concepto'
    nuevosConceptos:boolean=false
    precioFijoChecked:boolean=false;
    porcentajeChecked:boolean=false;
    disabledFP:boolean=true;
    descuentoButton=true;
    totalCalculado:number=0;
    totalVigente:number=0;
    totalActivos:number=0;
    totalDescuentos:number=0;
    totalCargos:number=0;
    totalAbonos:number=0;
    totalCancelados:number=0;
    conceptosDisabled:boolean=true;
    closeResult: string;
    quantity:number=1;
    quantityNva:number=1;
    todosChecked:boolean=false;
    activosChecked:boolean=true;
    canceladosChecked:boolean=false;
    devolucionesChecked:boolean=false;
    abonosChecked:boolean=false;
    cargosChecked:boolean=false;
    descuentosChecked:boolean=false;
    fechaCancelado:DateTime;
    inputDisabled:boolean=false
  
    /**Forms */
    nuevosConceptosFormGroup:FormGroup;
    abonoFormGroup:FormGroup;
    formGroup:FormGroup;
    secondFormGroup:FormGroup;
    myControl = new FormControl();
    isFormDisabled: boolean = false;  // Control whether form is disabled

    
    /**Loading  */
    isLoading:boolean=false
    isLoadingDesc:boolean=false
    submitted:boolean=false
    submittedAbono:boolean=false
    secondFormInvalid:boolean=false
  
    /**MAT TABLE */
    dataSource = new MatTableDataSource<edoCuenta>();
    displayedColumns:string[] = ['select','Fecha','Concepto','F.P.','_id','Valor','Fecha_Cancelado','Cantidad']
    
    /**Obseervables */
    formasDePago:string[]=['Efectivo','Tarjeta de Credito','Tarjeta de Debito']

    radioButtons = [
      { id: 'abonosRadio', label: 'Abonos', checked: 'abonosChecked' },
      { id: 'cargosRadio', label: 'Cargos', checked: 'cargosChecked' },
      { id: 'descuentosRadio', label: 'Descuentos', checked: 'descuentosChecked' },
      { id: 'cancelados', label: 'Cancelaciones y Devoluciones', checked: 'canceladosChecked' },
      { id: 'todos', label: 'Todos', checked: 'todosChecked' },

    ];

    @Input() currentHuesped:Huesped;
    @Input() currentEdoCuenta:edoCuenta[];
    @Input() codigosCargoList:Codigos[];

    @Output() honAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();
    @Output() honFetchReservations: EventEmitter<Huesped> = new EventEmitter();
    @Output() honAddPayment: EventEmitter<edoCuenta> = new EventEmitter();
    @Output() honRefreshEdoCuenta: EventEmitter<boolean> = new EventEmitter();
    @Output() honActualizaSaldo: EventEmitter<boolean> = new EventEmitter();
    constructor(    
      public modalService: NgbModal,
      private _codigoDeCargoService: CodigosService,
      private _edoCuentaService: Edo_Cuenta_Service,
      private fb : FormBuilder,
      private _authService: AuthService,
      private _logsService: LogService
    ){
      this.currentUser = this._authService.getUserInfo().username
    }
    ngOnInit(): void {
      if(this.currentHuesped.estatus === 'Reserva Cancelada' || this.currentHuesped.estatus === 'No Show' || this.currentHuesped.estatus === 'Check-Out'){
        this.inputDisabled=true
      }

  
      this.loadForm();
      this.getCodigosDeCargo();
      this.checkFormStatus();

    }
  
    maxCantidad(){
      if(this.calculatePendiente() < 0 ){
        this.honAlertMessage.emit({tittle:"Info", message:"El huesped tiene saldo a favor!"});
        return
      }else{
        this.abonosf.cantidadAbono.patchValue(this.calculatePendiente())
      }
    }
  
    actualizaHuesped(huesped:Huesped){
      this.honFetchReservations.emit(huesped);
    }    

    checkFormStatus() {
      const estatus = this.currentHuesped?.estatus;
      const disabledStatuses = [
        'Reserva Cancelada',
        'Reserva Confirmada',
        'Esperando Deposito',
        'Deposito Realizado',
        'Totalmente Pagada',
        'Reserva Sin Pago'
      ];
  
      // Set isFormDisabled to true if estatus matches any of the disabled statuses
      // Set isFormDisabled to true if estatus matches any of the disabled statuses
   // Set isFormDisabled to true if estatus matches any of the disabled statuses
      if (disabledStatuses.includes(estatus)) {
        this.isFormDisabled = true;

        // Disable the specific form controls safely
        const motivoDescControl = this.secondFormGroup.get('motivoDesc');
        const qtyPrecioControl = this.secondFormGroup.get('qtyPrecio');

        if (motivoDescControl) {
          motivoDescControl.disable();
        }

        if (qtyPrecioControl) {
          qtyPrecioControl.disable();
        }
      } else {
        // Enable the controls if the status doesn't match
        const motivoDescControl = this.secondFormGroup.get('motivoDesc');
        const qtyPrecioControl = this.secondFormGroup.get('qtyPrecio');

        if (motivoDescControl) {
          motivoDescControl.enable();
        }

        if (qtyPrecioControl) {
          qtyPrecioControl.enable();
        }
      }
    }
    
  
    
    loadForm(){
  
      this.formGroup= this.fb.group({
        concepto : ['',Validators.required],
        cantidad : [ {value:'', disabled:true}, Validators.required],
        precio : [{value:'', disabled:this.selectedService}, Validators.required],
      })
  
      this.nuevosConceptosFormGroup = this.fb.group({
        nuevoConcepto:['',Validators.required],
        nuevoPrecio:['',Validators.required],
        nuevaCantidad :[this.quantity,Validators.required]
      })
  
      this.abonoFormGroup= this.fb.group({
        conceptoManual : ['',Validators.required],
        cantidadAbono : ['',Validators.required],
        formaDePagoAbono : ['',Validators.required],
        notaAbono : [''],
      })
  
      this.secondFormGroup=this.fb.group({
        qtyPrecio:['',Validators.required],
        motivoDesc:['']
      },)
    }
  
    /**Useful Getter */
    get f() {return this.formGroup.controls}
    get abonosf() {return this.abonoFormGroup.controls}
    get second() {return this.secondFormGroup.controls}
    get nuevas() {return this.nuevosConceptosFormGroup.controls}
  
    getEdoCuenta(){
      
        this.listaEstadosCuenta = resetEstadoCuenta();
        this.dataSource.data = []
        
          this.currentEdoCuenta.map((item)=>{
            switch (item.Estatus) {
              case 'Activo':
                  this.listaEstadosCuenta.edoCuentaActivos.push(item);
                  this.listaEstadosCuenta.totalActivos += (item.Cargo! - item.Abono!);
          
                  if (item.Cargo != 0) {
                      this.listaEstadosCuenta.edoCuentaCargos.push(item);
                      this.listaEstadosCuenta.totalCargos += item.Cargo!;
                  }
          
                  if (item.Abono != 0 && item.Forma_de_Pago != 'Descuento') {
                      this.listaEstadosCuenta.edoCuentaAbonos.push(item);
                      this.listaEstadosCuenta.totalAbonos += item.Abono!;
                  }
          
                  if (item.Forma_de_Pago == 'Descuento') {
                      this.listaEstadosCuenta.edoCuentaDescuentos.push(item);
                      this.listaEstadosCuenta.totalDescuentos += item.Abono!;
                  }
                  break;
              case 'Cancelado':
                  this.listaEstadosCuenta.edoCuentaCancelados.push(item);
                  this.listaEstadosCuenta.totalCancelados += (item.Cargo! - item.Abono!);
                  break;
              case 'Devolucion':
                  this.listaEstadosCuenta.edoCuentaDevoluciones.push(item);
                  break;
              default:
                  // Handle other cases or do nothing
                  break;
              }
              this.listaEstadosCuenta.estadoDeCuenta.push(item) 
          });
  
            this.dataSource.data = this.listaEstadosCuenta.edoCuentaActivos
            this.currentEdoCuenta = this.listaEstadosCuenta.edoCuentaActivos
  
            let totalCargos=0;
            let totalAbonos=0;
  
            this.listaEstadosCuenta.edoCuentaActivos.map((item, index)=>{
              totalCargos = totalCargos + this.listaEstadosCuenta.edoCuentaActivos[index].Cargo!
              totalAbonos = totalAbonos + this.listaEstadosCuenta.edoCuentaActivos[index].Abono!
            })
            
            this.listaEstadosCuenta.totalCalculado=totalCargos-totalAbonos
            this.listaEstadosCuenta.totalVigente=this.listaEstadosCuenta.totalCalculado

            this.currentHuesped.pendiente = this.listaEstadosCuenta.totalCalculado
            this.currentHuesped.porPagar = totalCargos
  
            this.actualizaHuesped(this.currentHuesped);
    }
  
    getCodigosDeCargo(){
      this.codigosCargo = this.codigosCargoList.filter(item=>item.Tipo === 'C');
      this.codigosAbono = this.codigosCargoList.filter(item=>item.Tipo === 'A');
    }

    nuevoConcepto(){
      this.nuevosConceptos = !this.nuevosConceptos;
    }
  
    incrementQuantity(): void {
      this.quantity++;
      this.onChangeQty(this.quantity.toString());
    }
  
    // Method to decrement the quantity
    decrementQuantity(): void {
      if (this.quantity > 1) {
        this.quantity--;
        this.onChangeQty(this.quantity.toString());
      }
    }
  
    plusNinNva(qty:string){
        this.quantityNva++;
        this.onChangeQtyNva(this.quantityNva)
    }
    minusNinNva(qty:string){
      if(this.quantityNva > 0 ){
      this.quantityNva--;
      }
      else if(this.quantityNva = 0){
        this.quantityNva=1;
      }
      else {
        this.quantityNva
      }
      this.onChangeQtyNva(this.quantityNva)
    }

    // addPayment(tipo:string){
    //   let pago:edoCuenta
    //   if(tipo === 'Cargo'){
    //     pago = {
    //       id: (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'),
    //             Folio:this.currentHuesped.folio,
    //             Fecha:new Date(),
    //             Fecha_Cancelado:'',
    //             Referencia:'',
    //             Descripcion:this.codigoDeCargo.Descripcion,
    //             Forma_de_Pago:'No Aplica',
    //             Cantidad:this.quantity,
    //             Cargo:this.codigoDeCargo.Precio! * this.quantity,
    //             Abono:0,
    //             Estatus:'Activo'
    //           };
    //     this.honAddPayment.emit(pago);
    //   }else if(tipo === 'Abono' ){
    //     pago = {
    //       id: (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'),
    //       Folio:this.currentHuesped.folio,
    //       Fecha:new Date(),
    //       Fecha_Cancelado:'',
    //       Referencia:this.abonoFormGroup.controls["notaAbono"].value,
    //       Descripcion:this.abonoFormGroup.controls["conceptoManual"].value,
    //       Forma_de_Pago:this.abonoFormGroup.controls["formaDePagoAbono"].value,
    //       Cantidad:1,
    //       Cargo:0,
    //       Abono:this.abonoFormGroup.controls["cantidadAbono"].value,
    //       Estatus:'Activo'
    //     };
    //     this.honAddPayment.emit(pago);
    //   }      
    // }
  
    selectedValue(value:Codigos){
      this.quantity = 1;
      this.selectedService = false; // Enable buttons when a value is selected

     this.nuevosConceptos=false
      this.codigoDeCargo={
        Descripcion:value.Descripcion,
        Tipo:value.Tipo,
        Precio : value.Precio
      }

      this.formGroup.get('precio')?.enable();
      this.formGroup.get('cantidad')?.enable();

      this.formGroup.controls['precio'].setValue(this.codigoDeCargo.Precio);
      this.formGroup.controls['cantidad'].setValue(1);
    }
  
    onChangeQty(qty:string){
      if(parseInt(qty) <= 0){
        this.formGroup.controls['cantidad'].setValue(1);
        this.formGroup.controls['precio'].setValue(this.codigoDeCargo.Precio)
      
      }else{
        this.formGroup.controls['precio'].setValue((this.codigoDeCargo.Precio!)*parseInt(qty));
      }    
    }  
  
    onChangeQtyNva(qty:number){
      console.log(qty);
      // if(qty<=0)
      // {
      //   this.formGroup.controls['nuevaCantidad'].setValue(1);
      //   this.formGroup.controls['nuevoPrecio'].setValue(this.codigoDeCargo.Precio)
      
      // }else
      // {
      //   this.formGroup.controls['nuevoPrecio'].setValue((this.codigoDeCargo.Precio!)*qty);
      // }
          
    } 
  
    deleteRow(edo_cuenta:any){
  
      this.isLoading=true
  
      const modalRef = this.modalService.open(SuperUserComponent,{ size: 'sm', backdrop:'static' })
      modalRef.result.then((result) => {
        this.isLoading=false
  
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  
        });
     const sb = modalRef.componentInstance.passEntry.subscribe((receivedEntry:any) => {
  
            if(receivedEntry.id==3)
            {
              this.fechaCancelado=DateTime.now()
              
                    if(edo_cuenta.Forma_De_Pago=='No Aplica')
                    {
                      edo_cuenta.Estatus='Devolucion'
                    }
                    else
                    {
                      edo_cuenta.Estatus='Cancelado'
                    }
  
                    this._edoCuentaService.updateRow(edo_cuenta._id,edo_cuenta.Estatus,new Date(),receivedEntry.username).subscribe(
                      (value)=>{
                        this.isLoading=false
  
                        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
                        modalRef.componentInstance.alertHeader = 'Exito'
                        modalRef.componentInstance.mensaje='Movimiento Cancelado con Exito'   
                          setTimeout(() => {
                            modalRef.close('Close click');
                          },4000)
                          this.resetFiltros();
  
                          this.estadoDeCuenta=[]
                          this.getEdoCuenta();
                      },
                      (error)=>{
                        this.isLoading=false
                        if(error)
                        {
                          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
                          modalRef.componentInstance.alertHeader = 'Error'
                          modalRef.componentInstance.mensaje='No se pudo actualizar el estatus del Movimiento, Intente de nuevo mas tarde'
                        
                            setTimeout(() => {
                              modalRef.close('Close click');
                            },4000)
                            this.resetFiltros();   
                          this.isLoading=false
                      }
                    }
                      )
            }
            else 
            {
              const modalRef2= this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef2.componentInstance.alertHeader='Error'
              modalRef2.componentInstance.mensaje=receivedEntry.message
            }
        })
  this.subscription.push(sb)
  
    }
  
    selectedRadioButton(event:any)
    {
      if(event.source.id=='precioFijo')
      {
        if(event.source._checked==true)
        {
          this.descuentoButton=false;
          this.precioFijoChecked=true
          this.porcentajeChecked=false;
        }
        else if (event.source._checked==false)
        {
          this.descuentoButton=true;
          this.precioFijoChecked=false
        }
      }
      else if(event.source.id=='porcentaje')
      {
        if(event.source._checked==true)
        {
          this.descuentoButton=false
          this.porcentajeChecked=true
          this.precioFijoChecked=false;
        }      
        else if (event.source._checked==false)
        {
          this.descuentoButton=true
          this.porcentajeChecked=false;
        }
      }
      
    }
  
    selectedTable(event: MatRadioChange): void {
      const idMapping: { [key: string]: StateMapping } = {
        todos: {
          data: this.listaEstadosCuenta.estadoDeCuenta,
          total: this.totalVigente,
          checkedState: 'todosChecked'
        },
        cancelados: {
          data: this.listaEstadosCuenta.edoCuentaCancelados,
          total: this.totalCancelados,
          checkedState: 'canceladosChecked'
        },
        activos: {
          data: this.listaEstadosCuenta.edoCuentaActivos,
          total: this.totalActivos,
          checkedState: 'activosChecked'
        },
        devoluciones: {
          data: this.listaEstadosCuenta.edoCuentaDevoluciones,
          total: 0,
          checkedState: 'devolucionesChecked'
        },
        descuentosRadio: {
          data: this.listaEstadosCuenta.edoCuentaDescuentos,
          total: this.totalDescuentos,
          checkedState: 'descuentosChecked'
        },
        abonosRadio: {
          data: this.listaEstadosCuenta.edoCuentaAbonos,
          total: this.totalAbonos,
          checkedState: 'abonosChecked'
        },
        cargosRadio: {
          data: this.listaEstadosCuenta.edoCuentaCargos,
          total: this.totalCargos,
          checkedState: 'cargosChecked'
        }
      };
    
      const resetChecks = (): void => {
        this.todosChecked = false;
        this.activosChecked = false;
        this.canceladosChecked = false;
        this.devolucionesChecked = false;
        this.cargosChecked = false;
        this.abonosChecked = false;
        this.descuentosChecked = false;
      };
    
      const updateState = (state: StateMapping): void => {
        this.dataSource.data = state.data;
        this.totalCalculado = state.total;
        this[state.checkedState] = true;
      };
    
      const currentState = idMapping[event.source.id];
    
      if (currentState) {
        resetChecks();
        if (event.source.checked) {
          updateState(currentState);
        }
      }
    }
  

    ngOnChanges(change: SimpleChanges) {
      if(change.currentEdoCuenta) {
        this.getEdoCuenta();
      }
    }

    calculatePendiente(): number {
      let cargos = 0;
      let abonos = 0;
    
      this.currentEdoCuenta.forEach((item) => {
        if (item.Cargo) {
          cargos += item.Cargo;
        }
        if (item.Abono) {
          abonos += item.Abono;
        }
      });
    
      return cargos - abonos;
    }
  
    async onSubmitPayment(tipo: string) {
      if (this.abonoFormGroup.invalid && tipo === 'Abono') {
        this.submittedAbono = true;
        return;
      }
    
      this.isLoading = true;
    
      // Create the payment object based on the tipo
      let pago: edoCuenta;
    
      if (tipo === 'Cargo') {
        pago = {
          id: (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'),
          Folio: this.currentHuesped.folio,
          Fecha: new Date(),
          Fecha_Cancelado: '',
          Referencia: '',
          Descripcion: this.codigoDeCargo.Descripcion,
          Forma_de_Pago: 'No Aplica',
          Cantidad: this.quantity,
          Cargo: this.codigoDeCargo.Precio! * this.quantity,
          Abono: 0,
          Estatus: 'Activo',
          hotel: this.currentHuesped.hotel
        };
      } else if (tipo === 'Abono') {
        pago = {
          id: (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'),
          Folio: this.currentHuesped.folio,
          Fecha: new Date(),
          Fecha_Cancelado: '',
          Referencia: this.abonoFormGroup.controls["notaAbono"].value,
          Descripcion: this.abonoFormGroup.controls["conceptoManual"].value,
          Forma_de_Pago: this.abonoFormGroup.controls["formaDePagoAbono"].value,
          Cantidad: 1,
          Cargo: 0,
          Abono: this.abonoFormGroup.controls["cantidadAbono"].value,
          Estatus: 'Activo',
          hotel: this.currentHuesped.hotel
        };
      } else {
        // Handle unexpected tipo values
        console.error('Unexpected tipo value:', tipo);
        this.isLoading = false;
        return;
      }
    
      try {
        // Submit the payment
        await firstValueFrom(this._edoCuentaService.agregarPago(pago));
        
        // Log the payment
        const logRequests = this._logsService.logPagos('Movimiento Añadido', this.currentUser, pago).pipe(
          catchError(error => {
            console.error(`Failed to log parameters Change`, error);
            return of(null);
          })
        );
        await firstValueFrom(logRequests);
    
        // Show success modal
        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
        modalRef.componentInstance.alertHeader = 'Éxito';
        modalRef.componentInstance.mensaje = 'Movimiento agregado al Estado de Cuenta del Húesped';
    
        this.honActualizaSaldo.emit(true);
        setTimeout(() => {
          modalRef.close('Close click');
        }, 4000);
    
        // Reset the form and fetch updated data
        this.resetFiltros();
        this.formGroup.reset();
        this.abonoFormGroup.reset();
        this.estadoDeCuenta = [];
        this.getEdoCuenta();
    
      } catch (err: any) {
        // Show error modal
        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
        modalRef.componentInstance.alertHeader = 'Error';
        modalRef.componentInstance.mensaje = err.message;
    
        setTimeout(() => {
          modalRef.close('Close click');
        }, 4000);
    
        this.resetFiltros();
      } finally {
        this.isLoading = false;
      }
    }
    
    
    getFechaCancelado(row:any){
      if(row.hasOwnProperty('Fecha_Cancelado')){
        return row.Fecha_Cancelado.split('T')[0]
      }else{
        return ''
      }
    }

    calculoFooter(row:any){
      return 0
    }
    
  
    aplicaDescuento(autoriza:string){
      
      if(this.secondFormGroup.invalid)
      {
        this.secondFormInvalid=true
        return;
      }else{this.secondFormGroup.valid}{this.secondFormInvalid=false}
  
      this.descuentoButton=true
      this.isLoadingDesc=true
  
      let descuento:edoCuenta = {
        Folio:this.currentHuesped.folio,
        Fecha:new Date(),
        Fecha_Cancelado:'',
        Referencia:'',
        Descripcion:this.second.motivoDesc.value,
        Forma_de_Pago:'Descuento',
        Cantidad:1,
        Cargo:0,
        Abono:parseInt(this.second.qtyPrecio.value),
        Estatus:'Activo',
        Autorizo:autoriza
      }
  
      if( this.precioFijoChecked === true) { 
        descuento = {
          Folio:this.currentHuesped.folio,
          Fecha:new Date(),
          Fecha_Cancelado:'',
          Referencia:'',
          Descripcion:this.second.motivoDesc.value,
          Forma_de_Pago:'Descuento',
          Cantidad:1,
          Cargo:0,
          Abono:parseInt(this.second.qtyPrecio.value),
          Estatus:'Activo',
          Autorizo:autoriza
        }
  
        // totalConDescuento=totalConDescuento-(this.second.qtyPrecio.value ? null || undefined : 0)
  
      }
      if(this.porcentajeChecked==true)
      {
          descuento = {
          Folio:this.currentHuesped.folio,
          Fecha:new Date(),
          Referencia:'',
          Descripcion:this.second.motivoDesc.value + ' ('+this.second.qtyPrecio.value+'%'+')',
          Forma_de_Pago:'Descuento',
          Cantidad:1,
          Cargo:0,
          Abono:((this.totalCalculado * (this.second.qtyPrecio.value) ) / 100),
          Estatus:'Activo',
          Autorizo:autoriza
        }
  
      }
      this.honAddPayment.emit(descuento);
      this.isLoadingDesc=false
      this.secondFormGroup.reset();
      this.descuentoButton=false
      // this.estadoDeCuenta=[]
      this.getEdoCuenta();
        this.resetFiltros();
      this.isLoadingDesc=false
      this.descuentoButton=false
      this.isLoading=true
    }
    autoriza(){
      this.isLoading=true
      const modalRef = this.modalService.open(SuperUserComponent,{ size: 'sm', backdrop:'static' })
      modalRef.result.then((result) => {
        this.isLoading=false
  
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            this.estadoDeCuenta=[]
            this.getEdoCuenta();
            this.isLoading=false
        });
     const sb = modalRef.componentInstance.passEntry.subscribe((receivedEntry:any) => {
        this.isLoading=false
            if(receivedEntry === 3){
              this.aplicaDescuento(receivedEntry.username);
              modalRef.close()
            }else 
            {
              const modalRef2= this.modalService.open(AlertsComponent,{ size: 'md', backdrop:'static' })
              modalRef2.componentInstance.alertHeader='Error'
              modalRef2.componentInstance.mensaje='Usuario no autorizado para realizar descuentos'
            }
        })
  
        this.subscription.push(sb)
    }
    /*MODALS*/
    ajustes(){
      const modalRef = this.modalService.open(AjustesComponent,{ size: 'lg', backdrop:'static' })
      modalRef.componentInstance.huesped = this.currentHuesped
      modalRef.componentInstance.estadoDeCuenta=this.estadoDeCuenta
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            this.estadoDeCuenta=[]
            this.getEdoCuenta();
            
        });
        
    }
    abrirDetalle(row:any){
  
      const modalRef = this.modalService.open(DetalleComponent,{ size: 'md', backdrop:'static' })
      modalRef.componentInstance.row = row
      modalRef.componentInstance.folio = this.currentHuesped.folio
      if(row.hasOwnProperty('Fecha_Cancelado')){
        modalRef.componentInstance.fechaCancelado = row.Fecha_Cancelado.split('T')[0]
      }else{
        modalRef.componentInstance.fechaCancelado = ''
      }
  
  
    }
    resetFiltros(){
      this.activosChecked=true;
      this.canceladosChecked=false;
      this.devolucionesChecked=false;
      this.todosChecked=false;
    }

  
    isControlValid(controlName: string): boolean {
      const control = this.formGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }
  
    isControlInvalid(controlName: string): boolean {
      const control = this.formGroup.controls[controlName];
  
      return control.invalid && (control.dirty || control.touched);
    }
  
    isControlValidNuevo(controlName: string): boolean {
      const control = this.nuevosConceptosFormGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }
  
    isControlInvalidNuevo(controlName: string): boolean {
      const control = this.nuevosConceptosFormGroup.controls[controlName];
  
      return control.invalid && (control.dirty || control.touched);
    }
  
    isControlValidAbono(controlName: string): boolean {
      const control = this.abonoFormGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }
  
    isControlInvalidAbono(controlName: string): boolean {
      const control = this.abonoFormGroup.controls[controlName];
  
      return control.invalid && (control.dirty || control.touched);
    }
    isSecondControlValid(controlName: string): boolean {
      const control = this.secondFormGroup.controls[controlName];
      return control.valid && (control.dirty || control.touched);
    }
  
    isSecondControlInvalid(controlName: string): boolean {
      const control = this.secondFormGroup.controls[controlName];
      return control.invalid && (control.dirty || control.touched);
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