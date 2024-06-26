import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Huesped } from 'src/app/models/huesped.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HuespedService } from 'src/app/services/huesped.service';
import { Subject, firstValueFrom } from 'rxjs';
import { Estatus } from '../../_models/estatus.model';
import { ConfirmationModalComponent } from '../_modals/confirmation-modal.component';
import { HouseKeeping } from '../../_models/housekeeping.model';
import { Promesa } from '../../_models/promesas.model';
import { AlertsMessageInterface } from 'src/app/models/message.model';
import { edoCuenta } from '../../_models/estado_de_cuenta.model';
import { Adicional } from 'src/app/models/adicional.model';

@Component({
  selector: 'app-edit-reserva',
  templateUrl: './edit-reserva.component.html',
  styleUrls: ['./edit-reserva.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditReservaComponent implements OnInit{

  formGroup:FormGroup
  isLoading:boolean=false;
  selectedIndex:number
  @Input() promesasDisplay:boolean=false;
  /**Dates */
  intialDate:Date = new Date();
  todayDate:Date = new Date();

  /**DOM */
  colorAma:string=''

  //Models
  currentHuesped:any

  changingPromesasValue: Subject<Promesa[]> = new Subject();
  onSuccessResponse:Subject<boolean> = new Subject();
  adicionalSubject:Subject<Adicional[]> = new Subject();

  @Input() houseKeepingCodes:HouseKeeping[]=[]
  @Input() estatusArray:Estatus[]=[];
  @Input() data:any;
  @Input() llegahoy:boolean=false;

  @Output() onAgregarPago: EventEmitter<edoCuenta> = new EventEmitter();
  @Output() onEditRsv: EventEmitter<Huesped[]> = new EventEmitter();
  @Output() onOpenModifica: EventEmitter<Huesped> = new EventEmitter();
  @Output() onOpenEnviarReservacion: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetAdicionales: EventEmitter<boolean> = new EventEmitter();
  @Output() onGetPromesas: EventEmitter<string> = new EventEmitter();
  @Output() onUpdateEstatusHuesped: EventEmitter<Huesped> = new EventEmitter();
  @Output() onAlertMessage: EventEmitter<AlertsMessageInterface> = new EventEmitter();
  @Output() onGuardarPromesa: EventEmitter<any> = new EventEmitter();

  
  constructor(      
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    public fb:FormBuilder,

  ){

  }
  async ngOnInit(){
    
    this.changingPromesasValue.subscribe({
      next:(value)=>{
        this.changingPromesasValue.next(value);
      }
    })

    this.onSuccessResponse.subscribe({
      next:(val)=>{
        if(val){
          this.onSuccessResponse.next(val)
        }
      }
    })

    this.adicionalSubject.subscribe({
      next:(value:Adicional[])=>{
        this.adicionalSubject.next(value);
      }
    })

    let fechaDeLlegada = new Date(parseInt(this.currentHuesped.llegada.split('/')[2]),parseInt(this.currentHuesped.llegada.split('/')[1])-1,parseInt(this.currentHuesped.llegada.split('/')[0])) 
    this.intialDate = fechaDeLlegada

    this.formGroup = this.fb.group({
      estatus : [this.currentHuesped.estatus],
      ama:[this.currentHuesped.estatus_Ama_De_Llaves]
    }) 

  }

  setStep(index:number){
    this.selectedIndex=index;
  }

  backgroundColor(estatus:string){
    let color;

    for (let i=0;i<this.estatusArray.length;i++){
      if(estatus==this.estatusArray[i].estatus){
        color = this.estatusArray[i].color
      }
    }
    return color;
  }

  openDialog(huesped:Huesped,estatus:string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
      });
  
  
    modalRef.componentInstance.huesped = huesped;
    modalRef.componentInstance.estatus = estatus;

    modalRef.result.then((result) => {
      if(result=='Cancel')
      {
        // this.formGroup.patchValue(
        //   {'estatus':this.customerService.getCurrentHuespedValue.estatus}
        // );

        // this.formGroup.controls['estatus'].setValue(this.customerService.getCurrentHuespedValue.estatus);
      }
    }, (reason) => {
    });
    }

    todaysDateComparer(){
      //Disable CheckIn if the sTart Day is not today
      if(this.intialDate.setHours(0,0,0,0) == this.todayDate.setHours(0,0,0,0)) {
        return true
      }     
      else{
        return false
      }
  }

    openModifica(){
      this.onOpenModifica.emit(this.currentHuesped);
    }

    onChangeAma(ama:any){
      console.log("Selection change AMA: ",ama)

    }

    openEnviarConfirmacion(){
      this.onOpenEnviarReservacion.emit(true)
    }

    honGetAdicionales(flag:boolean){
      if(flag){
        this.onGetAdicionales.emit(true);
      }
    }

    honGetPromesas(folio:string){
        this.onGetPromesas.emit(folio);
    }

    honUpdateEstatusHuesped(huesped:Huesped){
      this.onUpdateEstatusHuesped.emit(huesped)
    }

    honAlertMessage(message:AlertsMessageInterface){
      this.onAlertMessage.emit(message)
    }

    honGuardarPromesa(promesa:any){
      this.onGuardarPromesa.emit(promesa);
    }

    honAgregarPago(pago:edoCuenta){
      this.onAgregarPago.emit(pago)
    }

  closeModal(){
    this.modal.close();
  }
}

