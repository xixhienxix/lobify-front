import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-explore-main-drawer',
  templateUrl: './explore-main-drawer.component.html',
})
export class ExploreMainDrawerComponent implements OnInit {
  appThemeName: string = '';
  appPurchaseUrl: string = '';
  appPreviewUrl: string = '';
  appDemos = '';

  constructor() {
  }

  ngOnInit(): void {
  }
}
