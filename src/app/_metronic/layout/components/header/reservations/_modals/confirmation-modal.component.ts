import { Component, OnInit,Input, ViewChild, OnDestroy } from '@angular/core';
import { NgbActiveModal,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Huesped } from 'src/app/models/huesped.model';
import { HuespedService } from 'src/app/services/huesped.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {

  @Input() huesped:any;
  @Input() estatus:any;
  
  closeResult: string;
  @ViewChild('exito') exito= null;
  @ViewChild('error') error= null;
  subscription:Subscription[]=[]
  constructor(
    public customerService: HuespedService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {

  }
  closeModal(sendData:any) {
    this.activeModal.close(sendData);
  }

  cambiaEstatus(huesped:Huesped){
    console.log(huesped)
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
}

ngOnDestroy(): void {
  this.subscription.forEach(sb=> sb.unsubscribe());
}
}


