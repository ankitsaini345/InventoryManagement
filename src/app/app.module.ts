import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AppComponent } from './app.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductEditComponent } from './product/product-edit/product-edit.component';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-db.service';
import { CardListComponent } from './card/card-list/card-list.component';
import { CardModifyComponent } from './card/card-modify/card-modify.component';
import { CardOrderDetailComponent } from './card/card-order-detail/card-order-detail.component';
import { CardBillPaymentComponent } from './card/card-bill-payment/card-bill-payment.component';
import { CardTxnsComponent } from './card/card-txns/card-txns.component';
import { TxnListComponent } from './txn/txn-list/txn-list.component';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './user/login/login.component';
import { AuthService } from './user/auth.service';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductEditComponent,
    ProductDetailComponent,
    HomeComponent,
    CardListComponent,
    CardModifyComponent,
    CardOrderDetailComponent,
    CardBillPaymentComponent,
    CardTxnsComponent,
    TxnListComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    Ng2SearchPipeModule,
    ToastrModule.forRoot(),
    environment.useInMemDB ?
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 100 }) : []
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
