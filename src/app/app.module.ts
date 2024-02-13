import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { AuthInterceptor } from './modules/auth/services/auth.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
// #fake-end#
import {MatSelectModule} from '@angular/material/select';
import { SharedModule } from './_metronic/shared/shared.module';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';


function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp({
      apiKey: environment.fireBaseStorageSecrets.apiKey,
      authDomain: environment.fireBaseStorageSecrets.authDomain,
      projectId: environment.fireBaseStorageSecrets.projectId,
      storageBucket: environment.fireBaseStorageSecrets.storageBucket,
      messagingSenderId: environment.fireBaseStorageSecrets.messagingSenderId,
      appId: environment.fireBaseStorageSecrets.appId,
      databaseURL: environment.fireBaseStorageSecrets.databaseURL,
    }),
    AngularFireStorageModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        }
  }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ClipboardModule,
    ReactiveFormsModule,
    MatSelectModule,
    SharedModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    SweetAlert2Module.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {    
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi:true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
