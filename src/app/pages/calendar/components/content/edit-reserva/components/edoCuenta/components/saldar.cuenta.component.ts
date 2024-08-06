import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import {DateTime} from 'luxon'
import { HuespedService } from 'src/app/services/huesped.service';
import { ParametrosService } from 'src/app/pages/parametros/_services/parametros.service';
import { Edo_Cuenta_Service } from 'src/app/services/edoCuenta.service';
import { EstatusService } from 'src/app/pages/calendar/_services/estatus.service';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { edoCuenta } from 'src/app/models/edoCuenta.model';

@Component({
  selector: 'app-saldar-cuenta',
  templateUrl: './saldar.cuenta.component.html',
  styleUrls: ['./saldar.cuenta.component.scss']
})
export class SaldoCuentaComponent implements OnInit {
  @Input() folio:string;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  tarifaDiasDiferencia:number
  subscription:Subscription[]=[]
  abonoFormGroup:FormGroup
  submittedAbono:boolean=false
  isLoading:boolean=false
  estadoDeCuenta:edoCuenta[]=[]
  formasDePago:string[]=['Efectivo','Tarjeta de Credito','Tarjeta de Debito']
  saldoPendiente:number

  constructor(public modal: NgbActiveModal,
    public fb :FormBuilder,
    public _huespedService:HuespedService,
    public _parametrosService:ParametrosService,
    public edoCuentaService:Edo_Cuenta_Service,
    public modalService:NgbModal,
    public estatusService:EstatusService
  ) {
    
   }

  ngOnInit(): void {
    this.abonoFormGroup= this.fb.group({
      conceptoManual : ['Pago de Cuenta',Validators.required],
      cantidadAbono : [this.saldoPendiente,Validators.required],
      formaDePagoAbono : ['',Validators.required],
      notaAbono : [''],
    })
  }

  get abonosf() {return this.abonoFormGroup.controls}


  onSubmitAbono(){
    
    if(this.abonoFormGroup.invalid)
    {
      this.submittedAbono=true
      return;
    }

    this.isLoading=true
    
    let pago:edoCuenta;

    
      pago = {

        Folio:this.folio,
        Fecha: new Date(),
        Fecha_Cancelado:'',
        Referencia:this.abonosf.notaAbono.value,
        Descripcion:this.abonosf.conceptoManual.value,
        Forma_de_Pago:this.abonosf.formaDePagoAbono.value,
        Cantidad:1,
        Cargo:0,
        Abono:this.abonosf.cantidadAbono.value,
        Estatus:'Activo'

      }
    

    
this.isLoading=true
    const sb = this.edoCuentaService.agregarPago(pago).subscribe(
      (value:any)=>{

        this.isLoading=false
       
            
        // this.estadoDeCuenta=[]
        // this.edoCuentaService.getCuentas(this.folio);
        this.passBack(value)
      
      },
      (err)=>
      {
        this.isLoading=false
        if(err)
        {
          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje=err.message

          this.isLoading=false
      
        }
      },
      ()=>{//FINALLY
      }
      )
      this.subscription.push(sb)
  }

  passBack(exito:string) {
    this.passEntry.emit(exito);
    }

  // maxCantidad(){
  //   this.abonosf.cantidadAbono.patchValue(this.saldoPendiente)
  // }

  isControlValidAbono(controlName: string): boolean {
    const control = this.abonoFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalidAbono(controlName: string): boolean {
    const control = this.abonoFormGroup.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }

  ngOnDestroy():void{
    this.subscription.forEach(sb=>sb.unsubscribe())
    this.modal.dismiss();
  }

}
