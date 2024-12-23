import { ChangeDetectionStrategy, Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
// language list
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { IndexDBCheckingService } from './services/_shared/indexdb.checking.service';
import { AuthService } from './modules/auth';
import { Router } from '@angular/router';

// import { setCulture,L10n } from '@syncfusion/ej2-base';
// import { default as EJ2_LOCALE } from "../../node_modules/@syncfusion/ej2-locale/src/es.json";


// L10n.load({ es: EJ2_LOCALE.es });
// setCulture("es")
@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault(); // Prevent the default context menu
  }
  

  supportedLanguages = ['en', 'es'];

  constructor(
    private translateServeice: TranslateService,
    private modeService: ThemeModeService,

  ) {
    // register translations
    translateServeice.addLangs(this.supportedLanguages);
    translateServeice.setDefaultLang(this.supportedLanguages[1]);
  }

  ngOnInit() {


    this.modeService.init();


  }
}
