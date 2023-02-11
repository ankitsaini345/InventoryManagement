import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { CardService } from './card/card.service';
import { PayeeService } from './payment/payee.service';
import { PaymentService } from './payment/payment.service';
import { ProductServiceService } from './product/product-service.service';
import { TxnService } from './txn/txn.service';
import { AuthService } from './user/auth.service';
import { User } from './user/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'InventoryManagement';
  items!: MenuItem[];
  rightItem!: MenuItem[];
  currentUser!: string;
  sub!: Subscription;

  constructor(private authService: AuthService,
    private messageService: MessageService,
    private productService: ProductServiceService,
    private cardService: CardService,
    private payeeService: PayeeService,
    private paymentService: PaymentService,
    private txnService: TxnService,
    private router: Router) { }


  ngOnInit(): void {
    this.initItems();
    this.initUserDetails();
    if (this.authService.isLoggedIn) {
      this.productService.initialiseProductData();
      this.cardService.initialiseCardData();
      this.txnService.initialiseTxnData();
      this.payeeService.initialiseData();
      this.paymentService.initialisePaymentData();
    }
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initItems() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        routerLink: '/home'
      },
      {
        label: 'Products',
        icon: 'pi pi-fw pi-mobile',
        items: [{
          label: 'All Products',
          icon: 'pi pi-fw pi-server',
          routerLink: '/products'
        },
        {
          label: 'Add New',
          icon: 'pi pi-fw pi-plus',
          routerLink: '/product/new/edit'
        }]
      },
      {
        label: 'Cards',
        icon: 'pi pi-fw pi-credit-card',
        style: { 'margin-left': 'auto' },
        items: [{
          label: 'All Cards',
          icon: 'pi pi-fw pi-server',
          routerLink: '/cards'
        },
        {
          label: 'Add New',
          icon: 'pi pi-fw pi-plus',
          routerLink: '/card/new/edit'
        }]
      },
      {
        label: 'Txns',
        icon: 'pi pi-fw pi-dollar',
        routerLink: '/transactions/All'
      },
      {
        label: 'Payee',
        icon: 'pi pi-fw pi-credit-card',
        style: { 'margin-left': 'auto' },
        items: [{
          label: 'All Payee',
          icon: 'pi pi-fw pi-server',
          routerLink: '/payee'
        },
        {
          label: 'Add New',
          icon: 'pi pi-fw pi-plus',
          routerLink: '/payee/new/edit'
        }]
      },
      {
        label: 'Payments',
        icon: 'pi pi-fw pi-credit-card',
        style: { 'margin-left': 'auto' },
        items: [{
          label: 'All Payments',
          icon: 'pi pi-fw pi-server',
          routerLink: '/payments/All'
        },
        {
          label: 'Add New',
          icon: 'pi pi-fw pi-plus',
          routerLink: '/payments/new/edit'
        }]
      }
    ];
  }

  initUserDetails() {
    try {
      this.sub = this.authService.getUserDetails().subscribe((user: User) => {
        this.currentUser = user.id;
        if (user.isLoggedIn) {
          this.rightItem = [
            {
              label: 'Manage',
              icon: 'pi pi-fw pi-cog'
            },
            {
              label: 'Logout',
              icon: 'pi pi-fw pi-power-off',
              command: (() => this.logout())
            }]
        } else {
          this.currentUser = 'Login';
          this.rightItem = [
            {
              label: 'Password??',
              icon: 'pi pi-fw pi-question-circle'
            },
            {
              label: 'Signup',
              icon: 'pi pi-fw pi-user-plus'
            }]
        }
      })
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Error in initialising user: ' + error.message });
    }
  }

  logout() {
    if (this.currentUser != 'Login') {
      this.authService.logout();
      this.initUserDetails()
    } else {
      this.router.navigate(['/login']);
    }
  }
}
