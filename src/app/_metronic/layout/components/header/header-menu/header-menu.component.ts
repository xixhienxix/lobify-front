/* eslint-disable @angular-eslint/no-output-on-prefix */
import { Component, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { Huesped } from 'src/app/models/huesped.model';
import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent implements OnInit {

  @Output() onOpenNuevaReserva: EventEmitter<boolean> = new EventEmitter();
  @Output() onOpenNvoBloqueo: EventEmitter<boolean> = new EventEmitter();
  @Input() onSavedReservation: Observable<Huesped[]>;

  constructor(private router: Router, private layout: LayoutService, private layoutInit: LayoutInitService, private translateService:TranslateService) {
    this.translateService.use('es')
  }

  ngOnInit(): void {}

  // onNvaReserva(huesped:any){  
  //   this.onAddPost.emit(huesped);
  // }

  openNvaReserva(){
    this.onOpenNuevaReserva.emit(true);
  }

  openNvoBloqueo(){
    this.onOpenNvoBloqueo.emit(true);
  }
  //HEADER FUNCTIONS

  calculateMenuItemCssClass(url: string): string {
    return checkIsActive(this.router.url, url) ? 'active' : '';
  }

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }

  setToolbar(toolbarLayout: 'classic' | 'accounting' | 'extended' | 'reports' | 'saas') {
    const currentConfig = {...this.layout.layoutConfigSubject.value};
    if (currentConfig && currentConfig.app && currentConfig.app.toolbar) {
      currentConfig.app.toolbar.layout = toolbarLayout;
      this.layout.saveBaseConfig(currentConfig)
    }
  }

}

const getCurrentUrl = (pathname: string): string => {
  return pathname.split(/[?#]/)[0];
};

const checkIsActive = (pathname: string, url: string) => {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }

  if (current === url) {
    return true;
  }

  if (current.indexOf(url) > -1) {
    return true;
  }

  return false;
};

