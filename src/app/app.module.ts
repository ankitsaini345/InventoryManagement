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
import { SpinnerComponent } from './spinner/spinner.component';


import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputTextModule} from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import {MenubarModule} from 'primeng/menubar'
import {MenuModule} from 'primeng/menu';
import { SplitButtonModule } from 'primeng/splitbutton';
import {CheckboxModule} from 'primeng/checkbox';
import {StyleClassModule} from 'primeng/styleclass';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';



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
    LoginComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    MenubarModule,
    MenuModule,
    ConfirmPopupModule,
    AutoCompleteModule,
    SplitButtonModule,
    TableModule,
    CheckboxModule,
    StyleClassModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    ProgressBarModule,
    Ng2SearchPipeModule,
    ToastrModule.forRoot(),
    environment.useInMemDB ?
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 100 }) : []
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true
  }, MessageService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
