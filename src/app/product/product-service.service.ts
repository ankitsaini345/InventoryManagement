import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { IProduct } from './product';
import { environment } from 'src/environments/environment';
import { CardService } from '../card/card.service';
import { TxnService } from '../txn/txn.service';
import { MessageService } from 'primeng/api';
import { Iresult } from './Iresult';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  private productStorageString = 'inventoryProducts';

  constructor(private http: HttpClient,
    private cardService: CardService,
    private txnService: TxnService,
    private messageService: MessageService
  ) {
    this.initialiseProductData();
  }

  private url = environment.baseUrl + 'api/orders';
  private productData$ = new BehaviorSubject<IProduct[]>([]);

  async initialiseProductData() {
    try {
      let products = sessionStorage.getItem(this.productStorageString);
      let productArray: IProduct[];
      if (products) {
        productArray = JSON.parse(products);
        this.productData$.next(productArray);
      } else {
        productArray = await firstValueFrom(this.http.get<IProduct[]>(this.url));
        this.productData$.next(productArray);
        sessionStorage.setItem(this.productStorageString, JSON.stringify(productArray));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Products Initialised' });
      }
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in initialising Products: ' + error.message });
    }
  }

  getProducts(): Observable<IProduct[]> {
    return this.productData$.asObservable();
  }

  getUniqueProducts(field: string): Observable<object> {
    const uniqueProductUrl = this.url + '/unique/' + field;
    return this.http.get(uniqueProductUrl);
  }

  getProduct(_id: string): IProduct {
    if (_id == 'new') return this.blankProduct();
    else {
      return this.productData$.getValue().find(p => p._id == _id)!;
    }
  }

  async addProduct(currentProduct: IProduct) {
    try {
      const res: Iresult = await firstValueFrom(this.http.post<Iresult>(this.url, currentProduct));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product ' + currentProduct.name + ' added.' });
        sessionStorage.removeItem(this.productStorageString);
        this.initialiseProductData();

        this.txnService.addTxnfromProduct(currentProduct);

        let updatedCard = this.cardService.getCard(currentProduct.cardHolder);
        updatedCard.amountDue += currentProduct.cardAmount;
        updatedCard.totalAmount += currentProduct.cardAmount;
        this.cardService.updateCard(updatedCard);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name });
        console.error('Unable to add Product ' + currentProduct.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unable to add Product ' + currentProduct.name + ' Error: ' + error.message });
      console.error('Unable to add Product ' + currentProduct.name + ' Error: ', error);
    }
  }

  async editProduct(currentProduct: IProduct, originalProduct: IProduct) {
    try {
      const res: Iresult = await firstValueFrom(this.http.put<Iresult>(this.url + '/' + currentProduct._id, currentProduct));
      if (res.acknowledged && res.modifiedCount) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product ' + currentProduct.name + ' Updated.' });
        sessionStorage.removeItem(this.productStorageString);
        this.initialiseProductData();
        
        if (currentProduct.cardAmount != originalProduct.cardAmount) {
          this.txnService.updateTxnUsingProduct(currentProduct);
          let updatedCard = this.cardService.getCard(currentProduct.cardHolder);
          updatedCard.amountDue -= originalProduct.cardAmount;
          updatedCard.amountDue += currentProduct.cardAmount;
          updatedCard.totalAmount -= originalProduct.cardAmount;
          updatedCard.totalAmount += currentProduct.cardAmount;
          this.cardService.updateCard(updatedCard);
        }
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name });
        console.error('Unable to add Product ' + currentProduct.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name + ' Error: ' + error.message });
      console.error('Unable to add Product ' + currentProduct.name + ' Error: ', error);
    }

  }

  async deleteProduct(currentProduct: IProduct) {
    try {
      const res: Iresult = await firstValueFrom(this.http.delete<Iresult>(this.url + '/' + currentProduct._id));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product ' + currentProduct.name + ' deleted.' });
        sessionStorage.removeItem(this.productStorageString);
        this.initialiseProductData();

        this.txnService.deleteTxn(currentProduct.txnId);

        let updatedCard = this.cardService.getCard(currentProduct.cardHolder);
        updatedCard.totalAmount -= currentProduct.cardAmount;
        if (updatedCard.amountDue >= currentProduct.cardAmount) updatedCard.amountDue -= currentProduct.cardAmount;
        this.cardService.updateCard(updatedCard);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name });
        console.error('Unable to add Product ' + currentProduct.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unable to add Product ' + currentProduct.name + ' Error: ' + error.message });
      console.error('Unable to add Product ' + currentProduct.name + ' Error: ', error);
    }
  }

  blankProduct(): IProduct {
    return {
      _id: 'new',
      name: '',
      date: new Date().toISOString().slice(0, 10),
      ram: 4,
      storage: 128,
      AppName: 'Amazon',
      status: 'Ordered',
      AppAccount: '',
      listPrice: 0,
      cardAmount: 0,
      costToMe: 0,
      buyerPrice: 0,
      coupon: 0,
      giftBalence: 0,
      cardDiscount: 0,
      cardHolder: '',
      deliveryDate: '',
      deliveryLoc: '',
      buyerDate: '',
      buyerName: 'AmtAryaNgr',
      profit: 0,
      txnId: '',
      cashback: 0,
      delivery: 0
    }
  }

}
