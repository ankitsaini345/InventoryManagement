

import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  customer = {
    email: '',
    pass: ''
  };
  errorMessage!: string;
  loading = false;
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.errorMessage = '';
  }

  async save(loginForm: NgForm) {
    this.loading = true;

    await this.authService.login(loginForm.form.value.email, loginForm.form.value.password);

    if(this.authService.errorMessage) {
      this.errorMessage = this.authService.errorMessage;
      alert(this.authService.errorMessage);
      console.log(this.authService.errorMessage);
    }
    else if (this.authService.isLoggedIn) {
      const url = this.authService.redirectUrl;
      this.authService.redirectUrl = '';
      if (url) {
        this.router.navigate([url]);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }
}
