import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardListComponent } from './card/card-list/card-list.component';
import { CardModifyComponent } from './card/card-modify/card-modify.component';
import { CardOrderDetailComponent } from './card/card-order-detail/card-order-detail.component';
import { CardTxnsComponent } from './card/card-txns/card-txns.component';
import { HomeComponent } from './home/home.component';
import { PayeeEditComponent } from './payment/payee-edit/payee-edit.component';
import { PayeeListComponent } from './payment/payee-list/payee-list.component';
import { PaymentEditComponent } from './payment/payment-edit/payment-edit.component';
import { PaymentListComponent } from './payment/payment-list/payment-list.component';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';
import { ProductEditComponent } from './product/product-edit/product-edit.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { TxnListComponent } from './txn/txn-list/txn-list.component';
import { AuthGuard } from './user/auth.guard';
import { LoginComponent } from './user/login/login.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'product/:id/edit', component: ProductEditComponent, canActivate: [AuthGuard] },
  { path: 'product/:id/detail', component: ProductDetailComponent, canActivate: [AuthGuard] },
  { path: 'cards', component: CardListComponent, canActivate: [AuthGuard] },
  { path: 'card/:_id/edit', component: CardModifyComponent, canActivate: [AuthGuard] },
  { path: 'card/:name/detail', component: CardOrderDetailComponent, canActivate: [AuthGuard] },

  { path: 'payee', component: PayeeListComponent, canActivate: [AuthGuard] },
  { path: 'payee/:_id/edit', component: PayeeEditComponent, canActivate: [AuthGuard]},

  { path: 'payments/:_id/edit', component: PaymentEditComponent, canActivate: [AuthGuard]},
  { path: 'payments/:name', component: PaymentListComponent, canActivate: [AuthGuard] },

  { path: 'transactions/:cname', component: TxnListComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];




@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
