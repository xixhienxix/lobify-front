import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subscription } from 'rxjs';

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
export class SaldoCuentaComponent implements OnInit, OnDestroy {
  @Input() folio:string;
  @Input() desgloseEdoCuenta:any;
  @Input() saldoPendiente:number=0;
  @Input() pendienteHospedaje:number=0;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  tarifaDiasDiferencia:number
  subscription:Subscription[]=[]
  abonoFormGroup:FormGroup
  submittedAbono:boolean=false
  isLoading:boolean=false
  estadoDeCuenta:edoCuenta[]=[]
  formasDePago:string[]=['Efectivo','Tarjeta de Credito','Tarjeta de Debito', 'Cortesía']

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
    
    let pago, updatedHospedaje:edoCuenta;

    
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

      updatedHospedaje = {
        Folio:this.folio,
        Fecha: new Date(),
        Fecha_Cancelado:'',
        Referencia:'',
        Descripcion:'HOSPEDAJE',
        Forma_de_Pago:'',
        Cantidad:1,
        Cargo:this.pendienteHospedaje,
        Abono:0,
        Estatus:'Activo',
        Total:this.pendienteHospedaje
      }

      const actualizarSaldos = [
        this.edoCuentaService.agregarPago(pago),
        this.edoCuentaService.updateRowByConcepto(this.folio, 'HOSPEDAJE', updatedHospedaje)
      ];
      
      const sb = forkJoin(actualizarSaldos).subscribe({
        next: ([pagoResponse, hospedajeResponse]) => {
          this.isLoading = false;
      
          // Do something with both responses
          this.passBack('exito'); // or pass both if needed
        },
        error: (err) => {
          this.isLoading = false;
      
          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop: 'static' });
          modalRef.componentInstance.alertHeader = 'Error';
          modalRef.componentInstance.mensaje = err.message;
        },
        complete: () => {
          // Optional: final cleanup
        }
      });
      
      this.subscription.push(sb);
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
