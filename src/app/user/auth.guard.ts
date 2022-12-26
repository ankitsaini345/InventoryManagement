import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

constructor(private authService:AuthService, private router:Router) {

}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log('islogin', this.authService.isLoggedIn);
      
      if(this.authService.isLoggedIn) return true;
      else {
        this.authService.redirectUrl = state.url;
        alert('Please login to continue');
        this.router.navigate(['/login']);
        return false;
      }
  }
  
}
