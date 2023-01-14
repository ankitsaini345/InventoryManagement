import { Injectable } from '@angular/core';
import { User } from './user';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom, retry, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {

  currentUser!: string | null;
  redirectUrl!: string;
  errorMessage: string;

  get isLoggedIn(): boolean {
    const tempUser = localStorage.getItem('inventoryAppUser');
    if (tempUser) {
      this.currentUser = tempUser;
      return true;
    } else return false;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastrService ) {
    this.errorMessage = '';
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
            this.toastService.error(error.status + ' ' + error.message)
            if (error.status === 401 && error.error?.message == 'jwt expired') {
              console.log('Token Expired. Generating new token...');
              this.toastService.error('Token Expired. Generating new token...')
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
      if (!userId || !password) {
        throw 'Username/Password is Missing..'
      } else {
        const result: any = await firstValueFrom(this.http.post(environment.baseUrl + 'api/login', { userId, password }));
        if (result && result.userId) {
          localStorage.removeItem('inventoryAppToken');
          localStorage.removeItem('inventoryAppUser');

          localStorage.setItem('inventoryAppToken', result.authToken);
          localStorage.setItem('inventoryAppUser', result.userId);
          this.currentUser = result.userId;
        } else if (result.error) throw result.message;
        else throw 'unknown error while logging in. please try again...'
      }
    } catch (error: any) {
      console.log(error);
      if (error.error.error) {
        this.errorMessage = error.error.message;
      }
      else this.errorMessage = error.message;
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('inventoryAppToken');
    localStorage.removeItem('inventoryAppUser');
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
        this.currentUser = result.id;
      } else if (result.error) throw result.message;
      else throw 'unknown error while refreshing token. redirecting to login page.'
    }
    catch (error: any) {
      this.router.navigate(['/login']);
      this.errorMessage = error.message
    }
  }
}