import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
// language list
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  supportedLanguages = ['en', 'es'];

  constructor(
    private translateServeice: TranslateService,
    private modeService: ThemeModeService
  ) {
    // register translations
    translateServeice.addLangs(this.supportedLanguages);
    translateServeice.setDefaultLang(this.supportedLanguages[1]);
  }

  ngOnInit() {
    this.modeService.init();
  }
}
