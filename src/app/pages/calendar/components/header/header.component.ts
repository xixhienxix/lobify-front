import { Component } from '@angular/core';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
// import { CustomerService } from '../../_services/customer_service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})


export class HeaderComponent {

  constructor(    
    // private customerService: CustomerService
    ){

  }

  closeResult: string;

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
