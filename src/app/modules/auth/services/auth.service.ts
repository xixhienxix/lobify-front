import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, finalize, timeout } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

export type UserType = UserModel | undefined;
export const DEFAULT_AUTH = {
  authToken: '',
  refreshToken: '',
  expiresIn: 0
}
@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; 
  authModel:AuthModel= DEFAULT_AUTH
  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get getcurrentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set setcurrentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private router: Router,
    private http : HttpClient,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    // const subscr = this.getUserByToken().subscribe();
    // this.unsubscribe.push(subscr);
  }

  // public methods
  login(username: string, password: string): Observable<UserType|string> {
    this.isLoadingSubject.next(true);

    return this.http.post<UserModel|string>(environment.apiUrl+"/login",{username,password})
    .pipe(
      map((datosUsuario:any)=>{
        if(datosUsuario.mensaje== 'usuario inexistente' )
        {
          return 'Usuario Inexistente' 
        }
        else if(datosUsuario){
          let usuario:UserModel;

               usuario = datosUsuario
               this.currentUserSubject.next(usuario);
               this.currentUserSubject = new BehaviorSubject<UserType>(usuario);
               this.setAuthFromLocalStorage(usuario)
               return usuario
        }
      }),
      //switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem('ACCESS_TOKEN');
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  registration(hotels:string,fullname:string,email:string,username:string,password:string,terminos:boolean){
    const hotel = sessionStorage.getItem("HOTEL") as string;
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);
    let mensaje=''
    return this.http.post<any>(environment.apiUrl+"/createdb",{params:queryParams,hotels,fullname,email,username,password,terminos})
    .pipe(map(res=>{
      if(res.mensaje == "Usuario agregado con exito"){

        return res
      }
      if(res.response == 'El nombre de usuario no se puede usar, especifique otro'){
        
        return res.response
      }
      else {
        return mensaje ='No se pudo registrar al usuario'
      }
    }))
  }

  getUserByTokenBackend(_token: string): Observable<UserModel> {
    // const httpHeaders = new HttpHeaders({
    //   Authorization: `${token}`,
    // });
    return this.http.get<UserModel>(environment.apiUrl+'/getUserByToken', {// for getting user data from token on refresh of the page
      // headers: httpHeaders,
    })
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.getUserByTokenBackend(auth.authToken).pipe(
      map((user: any) => {
        if ((user.exp < (Math.floor(Date.now() / 1000)))) {
          this.logout();
        } else {
          this.currentUserSubject.next(user);
        }
        return user.usuariosResultQuery;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  


  // private methods
  private setAuthFromLocalStorage(auth: UserModel): boolean {
    const authInfo = {
      username:auth.username,
      name:auth.firstname
    }
    localStorage.setItem('USER',JSON.stringify(authInfo))
    localStorage.setItem('HOTEL',auth.hotel.replace(/\s+$/, ''))
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.accessToken) {
      localStorage.setItem('ACCESS_TOKEN',auth.accessToken);
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem('ACCESS_TOKEN');
      if (!lsValue) {
        return undefined;
      }
      const expireIn = this.tokenExpired(lsValue)
      const authData = lsValue;

      this.authModel.authToken=authData
      this.authModel.expiresIn=expireIn

      return this.authModel;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  getUserInfo(): any {
    const userInfo = localStorage.getItem("USER");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  private tokenExpired(token: string) {
    // return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    return (JSON.parse(atob(token.split('.')[1]))).exp;
  }

  // registration(user: UserModel): Observable<any> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService.createUser(user).pipe(
  //     map(() => {
  //       this.isLoadingSubject.next(false);
  //     }),
  //     switchMap(() => this.login(user.email, user.password)),
  //     catchError((err) => {
  //       console.error('err', err);
  //       return of(undefined);
  //     }),
  //     finalize(() => this.isLoadingSubject.next(false))
  //   );
  // }
  autoriza(username:string,password:string){
    return this.http.post<UserModel|string>(environment.apiUrl+"/auth/autoriza",{username,password})
    .pipe(
      map((datosUsuario:any)=>{
        if(!datosUsuario){
          return { id: 1, message: 'Usuario invalido' }
        }else{
          if(datosUsuario.perfil === 1 ){
            return { id: 3, message: 'Usuario Autorizado' }
          }else{
            return { id: 4, message: 'Usuario No Autorizado' }
          }
        }
      }),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );   
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
