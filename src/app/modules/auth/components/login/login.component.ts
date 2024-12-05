import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IndexDBCheckingService } from 'src/app/services/_shared/indexdb.checking.service';
export interface userAccesed {
  user: UserModel | undefined,
  accessToken: string;
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:

  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  message: string;


  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _checkIndexDbService: IndexDBCheckingService
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.getcurrentUserValue) {
      this.router.navigate(['/Dashboard']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/dashboard';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['',
        Validators.compose([
          Validators.required,
        ]),
      ],
      password: ['',
        Validators.compose([
          Validators.required,
        ]),
      ],
    });
  }

  submit() {
    this.hasError = false;
    const loginSubscr = this.authService
      .login(this.f.username.value.trim(), this.f.password.value)
      .subscribe(() => {
        if (this.authService.getcurrentUserValue?.accessToken) {
          
          const servicesToCheck = [
            'parametros', 
            'housekeeping', 
            'bloqueos', 
            'estatus', 
            'habitaciones', 
            'logs', 
            'reservaciones', 
            'tarifas', 
            'codes'
          ];

          this._checkIndexDbService.checkIndexedDB(servicesToCheck);

          this.router.navigate([this.returnUrl]);
        } else {
          this.message = 'Usuario y/o contraseña inexistente'
          this.hasError = true;
        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
