import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CardService } from './card/card.service';
import { PayeeService } from './payment/payee.service';
import { PaymentService } from './payment/payment.service';
import { ProductServiceService } from './product/product-service.service';
import { TxnService } from './txn/txn.service';
import { ObjectId } from 'bson';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private productService: ProductServiceService,
    private cardService: CardService,
    private payeeService: PayeeService,
    private paymentService: PaymentService,
    private txnService: TxnService
  ) {}
  private editDataStorageString = 'inventoryEditDetails';
  private url = environment.baseUrl + 'api';

  private storedData: any = null;

  setStoredData(data: any) {
    this.storedData = data;
    localStorage.setItem(this.editDataStorageString, JSON.stringify(data));
  }

  async getEditDetails(update = true) {
    const editDataFromAPI: any = (await firstValueFrom(
      this.http.get<any[]>(this.url + '/geteditdetail')
    ))[0];
    let editDataFromLocal: any = localStorage.getItem(
      this.editDataStorageString
    );
    this.setStoredData(editDataFromAPI);

    if (!editDataFromLocal) {
      this.productService.initialiseProductData();
      this.cardService.initialiseCardData();
      this.txnService.initialiseTxnData();
      this.payeeService.initialiseData();
      this.paymentService.initialisePaymentData();
    } else if (editDataFromLocal && editDataFromAPI) {
      editDataFromLocal = JSON.parse(editDataFromLocal);
      if (editDataFromAPI['orders'] != editDataFromLocal['orders'])
      this.productService.reload();
      else 
      this.productService.initialiseProductData();
      
      if (editDataFromAPI['payee'] != editDataFromLocal['payee'])
      this.payeeService.reload();
      else
      this.payeeService.initialiseData();

      if (editDataFromAPI['payments'] != editDataFromLocal['payments'])
      this.paymentService.reload();
      else
      this.paymentService.initialisePaymentData();

      if (editDataFromAPI['transactions'] != editDataFromLocal['transactions'])
      this.txnService.reload();
      else
      this.txnService.initialiseTxnData();

      if (editDataFromAPI['cards'] != editDataFromLocal['cards'])
      this.cardService.reload();
      else
      this.cardService.initialiseCardData();
    }
  }


}
