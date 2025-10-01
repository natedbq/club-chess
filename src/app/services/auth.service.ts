import { HttpClient, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { Configuration } from "../app.configuration";
import { UserService } from "./user.service";

class Keys {
  static JWT_KEY = "club.chess.jwt";
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string = `${Configuration.apiUrl}/auth`;
  constructor(private http: HttpClient, private authInterceptor: AuthInterceptor) {
    
  }
     
  authenticate(username: string, password: string){
    return this.http.post<{ accessToken: string, expiresInMinutes: number }>(this.api, { username, password }
        , { withCredentials: true } ).pipe(tap((jwt) => {
        sessionStorage.setItem(Keys.JWT_KEY, jwt.accessToken);
        
    }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    private readonly api: string = `${Configuration.apiUrl}/auth`;
    constructor(private http: HttpClient) {
    }

    tries = 0;
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if(!req.url.startsWith(Configuration.apiUrl)){
            return next.handle(req);
        }
        const token = sessionStorage.getItem(Keys.JWT_KEY);
        if (token) {
            req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
            });
        }

        return next.handle(req).pipe(
            catchError(err => {
                this.tries++;
                if(this.tries > 5){
                    this.tries = 0;
                    return of();
                }
                sessionStorage.removeItem(Keys.JWT_KEY);
                // Try refresh token flow
                return this.refreshToken().pipe(
                switchMap(newToken => {
                    sessionStorage.setItem(Keys.JWT_KEY, newToken);

                    req = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                    });
                    return next.handle(req);
                })
                );

            return throwError(() => err);
            })
        );
    }

    refreshToken(): Observable<string> {
        return this.http.post<{ accessToken: string }>(`${this.api}/refresh`,null,{ withCredentials: true } ).pipe(
            tap(response => {
                sessionStorage.setItem(Keys.JWT_KEY, response.accessToken);
            }),
            map(response => response.accessToken)
        );
    }
}