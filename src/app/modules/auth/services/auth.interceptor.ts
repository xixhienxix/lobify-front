import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = localStorage.getItem("ACCESS_TOKEN") || '';
        const hotel = localStorage.getItem("HOTEL") || '';

        if(authToken){

            const cloned = req.clone({
                    setHeaders: {
                      'Content-Type' : 'application/json; charset=utf-8',
                      'Accept'       : 'application/json',
                      'Authorization': `${authToken}`,
                      'Hotel': hotel,
                    },
            })
            return next.handle(cloned)
        }
        else {
            return next.handle(req)
        }
    }
}
