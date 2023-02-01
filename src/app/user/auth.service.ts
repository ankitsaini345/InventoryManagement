import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {

  private userDetails$!: BehaviorSubject<User>;

  redirectUrl!: string;
  errorMessage!: string;
  get isLoggedIn(): boolean {
    if (localStorage.getItem('inventoryAppUser'))
      return true;
    return false;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {
    this.errorMessage = '';
    console.log('authser');
    
    if (localStorage.getItem('inventoryAppUser'))
      this.userDetails$ = new BehaviorSubject<User>({ id: localStorage.getItem('inventoryAppUser')!, isLoggedIn: true });
    else
      this.userDetails$ = new BehaviorSubject<User>({ id: '', isLoggedIn: false });

  }

  getUserDetails(): Observable<User> {
    return this.userDetails$.asObservable();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let token = localStorage.getItem('inventoryAppToken');
    if (token) {
      const modifiedRequest = req.clone({
        setHeaders: { 'authorization': 'Bearer ' + token }
      });
      return next.handle(modifiedRequest)
        .pipe(
          tap({
            next: (event) => {
              if (event instanceof HttpResponse) {

              }
              return event;
            },
            error: async (error) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error.status + ' ' + error.message });

              if (error.status === 401 && error.error?.message == 'jwt expired') {
                console.log('Token Expired. Generating new token...');
                this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Token Expired. Generating new token...' });

                await this.refreshToken();
                token = localStorage.getItem('inventoryAppToken');
                window.location.reload();
              } else console.log(error);
            }
          }));
    }
    else {
      console.log('auth token not found in browser.');
      return next.handle(req);
    }
  }

  async login(userId: string, password: string) {
    this.errorMessage = '';
    try {
      if (!(userId && password)) {
        throw 'Username/Password is Missing..'
      } else {
        const result: any = await firstValueFrom(this.http.post(environment.baseUrl + 'api/login', { userId, password }));
        if (result && result.userId) {
          localStorage.removeItem('inventoryAppToken');
          localStorage.removeItem('inventoryAppUser');

          localStorage.setItem('inventoryAppToken', result.authToken);
          localStorage.setItem('inventoryAppUser', result.userId);

          this.userDetails$.next({
            id: result.userId,
            isLoggedIn: true
          })

        } else if (result.error) throw result.message;
        else throw 'unknown error while logging in. please try again...'
      }
    } catch (error: any) {
      console.log(error);
      if (error.error.error) {
        this.errorMessage = error.error.message;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error.message });
      }
      else
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });

    }
  }

  logout(): void {
    this.userDetails$.next({
      id: '',
      isLoggedIn: false
    })
    localStorage.removeItem('inventoryAppToken');
    localStorage.removeItem('inventoryAppUser');

    sessionStorage.removeItem('inventoryProducts');
    sessionStorage.removeItem('inventoryCards');
    sessionStorage.removeItem('inventoryTxns');

    this.router.navigate(['/login']);
  }

  async refreshToken() {
    try {
      const result: any = await firstValueFrom(this.http.get(environment.baseUrl + 'api/refresh'));
      if (result && result.id) {
        localStorage.removeItem('inventoryAppToken');
        localStorage.removeItem('inventoryAppUser');

        localStorage.setItem('inventoryAppToken', result.newToken);
        localStorage.setItem('inventoryAppUser', result.id);
        this.userDetails$.next({
          id: result.userId,
          isLoggedIn: true
        })
      } else if (result.error) throw result.message;
      else throw 'unknown error while refreshing token. redirecting to login page.'
    }
    catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      this.router.navigate(['/login']);
    }
  }
}