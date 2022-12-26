import { Component, OnInit } from '@angular/core';
import { AuthService } from './user/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'InventoryManagement';

  get isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  logout() {
    this.authService.logout();
  }

}
