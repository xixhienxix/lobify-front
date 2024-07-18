import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-help-drawer',
  templateUrl: './help-drawer.component.html',
})
export class HelpDrawerComponent implements OnInit {
  appThemeName: string = '';
  appPurchaseUrl: string = '';

  constructor() {
  }

  ngOnInit(): void {
  }
}
