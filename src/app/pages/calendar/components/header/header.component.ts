import { Component } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { NvaReservaComponent } from 'src/app/pages/reservations/nva-reserva/nva-reserva.component';
// import { CustomerService } from '../../_services/customer_service';
import { Subscription } from 'rxjs';
import { Foliador } from '../../_models/foliador.model';

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

  closeResult: string;
  private subscriptions: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  /**Models */
  folios:Foliador[]=[];

  create(){
    this.edit();
  }

  edit(id?: number) {

    if(id==undefined)
    {
      // const modalRef = this.modalService.open(NvaReservaComponent, { size: 'md',backdrop: 'static' });
      // modalRef.componentInstance.folios = this.folios
      // modalRef.componentInstance.id = id;

      // modalRef.result.then( () =>
      //   //Update Customer Subject
      // () => { }
      // );

      // modalRef.result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
      // }, (reason) => {
      //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      // });
    }
    else
    {

    // const sb = this.customerService.getItemById(id).pipe(
    //       first(),
    //       catchError((errorMessage) => {
    //         console.log("ERROR MESSAGE PIPE DESPUES DEL GETELEMETN BY ID",errorMessage)
    //         return of(EMPTY_CUSTOMER);
    //       })
    //     ).subscribe((huesped1: Huesped) => {
    //       this.huesped = huesped1;
    //       this.customerService.setCurrentHuespedValue=huesped1

    //       const modalRef = this.modalService.open(EditReservaModalComponent, { size: 'md',backdrop: 'static' });
    //       modalRef.componentInstance.folio = id;
    //       modalRef.componentInstance.id = id;

    //       modalRef.result.then((result) => {
    //         this.closeResult = `Closed with: ${result}`;
    //       }, (reason) => {
    //         this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //       });


    //     });

    //     this.customerService.fetch(),

        // this.subscriptions.push(sb);
    }
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
