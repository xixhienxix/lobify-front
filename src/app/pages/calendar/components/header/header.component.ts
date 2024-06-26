import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { NvaReservaComponent } from 'src/app/pages/reservations/nva-reserva/nva-reserva.component';
// import { CustomerService } from '../../_services/customer_service';
import { Subscription } from 'rxjs';
import { Foliador } from '../../_models/foliador.model';
import { NvaReservaComponent } from '../../reservations/nva-reserva/nva-reserva.component';
import { Huesped } from 'src/app/models/huesped.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})


export class HeaderComponent {

  constructor(    
    private modalService: NgbModal,
    // private customerService: CustomerService
    ){

  }
  
  @Output() onNvaReserva: EventEmitter<Huesped[]> = new EventEmitter();
  @ViewChild('nvaReserva') nvaReserva!: NvaReservaComponent;

  closeResult: string;

  openNvaReserva(){
    const modalRef = this.modalService.open(NvaReservaComponent,{ size: 'md', backdrop:'static' })  
    modalRef.componentInstance.onNvaReserva.subscribe((receivedEntry:Huesped[]) => {
      this.onNvaReserva.emit(receivedEntry);
      })
    modalRef.result.then((result) => {
        console.log(result)
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  
      return
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
}
