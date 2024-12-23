import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerI18n} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  
  row:any
  folio:string=''
  fechaCancelado:string=''

  constructor(
    public modal: NgbActiveModal,
    public i18n: NgbDatepickerI18n,


  ) { }

  ngOnInit(): void {
    
  }

  getUser(){
    const userJson = localStorage.getItem('USER');
    if (userJson) {
      // Parse the JSON string to get the JavaScript object
      const user = JSON.parse(userJson);
    
      // Access the desired properties
      return user.username;

    } else {
      return 'ADMIN'
    }
  }



}
