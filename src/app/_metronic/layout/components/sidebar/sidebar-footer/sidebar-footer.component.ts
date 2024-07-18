import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-sidebar-footer',
  templateUrl: './sidebar-footer.component.html',
  styleUrls: ['./sidebar-footer.component.scss'],
})
export class SidebarFooterComponent implements OnInit {
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  itemClass: string = 'ms-1 ms-lg-3';
  nombre:string|undefined=''

  constructor(public authService:AuthService) {
    this.nombre = this.authService.getcurrentUserValue?.nombre
  }

  ngOnInit(): void {}
}
