import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { IProduct, IProductStats } from './product';
import { environment } from 'src/environments/environment';
import { CardService } from '../card/card.service';
import { TxnService } from '../txn/txn.service';
import { MessageService } from 'primeng/api';
import { Iresult } from './Iresult';
import { CommitService } from '../commit.service';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  private productStorageString = 'inventoryProducts';
  private uniqueProductStorageString = 'inventoryUniqueProducts';
  private uniqueAppAccountStorageString = 'inventoryUniqueAppAccounts';

  constructor(private http: HttpClient,
    private cardService: CardService,
    private txnService: TxnService,
    private commitService: CommitService,
    private messageService: MessageService
  ) {
    // this.initialiseProductData();
  }

  reload(limit = 50) {
    localStorage.removeItem(this.productStorageString);
    this.initialiseProductData(limit);
  }

  private url = environment.baseUrl + 'api/orders';
  private productData$ = new BehaviorSubject<IProduct[]>([]);
  private uniqueProductName$ = new BehaviorSubject<string[]>([]);
  private uniqueAccountName$ = new BehaviorSubject<string[]>([]);

  private statsData$ = new BehaviorSubject<IProductStats>({
    undeliveredCount: 0,
    deliveredCount: 0,
    OrderCount: 0,
    buyerCount: 0,
    undeliveredAmount: 0,
    deliveredAmount: 0,
    OrderAmount: 0,
    buyerAmount: 0
  });

  async initialiseProductData(limit = 50) {
    try {
      let products = localStorage.getItem(this.productStorageString);
      let productArray: IProduct[];
      if (products) {
        productArray = JSON.parse(products);
        this.productData$.next(productArray);
        this.caclStats();
      } else {
        productArray = await firstValueFrom(this.http.get<IProduct[]>(this.url + '?limit=' + limit));
        this.productData$.next(productArray);
        this.caclStats();
        localStorage.setItem(this.productStorageString, JSON.stringify(productArray));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Products Initialised' });
      }

      let uniqueProductArray = this.extractFieldArray(productArray, 'name');
      this.uniqueProductName$.next(uniqueProductArray);

      let uniqueAppAccountArray = this.extractFieldArray(productArray, 'AppAccount');
      this.uniqueAccountName$.next(uniqueAppAccountArray);

    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Error in initialising Products: ' + error.message });
    }
  }

  caclStats() {
    let total: IProductStats = {
      undeliveredCount: 0,
      deliveredCount: 0,
      OrderCount: 0,
      buyerCount: 0,
      undeliveredAmount: 0,
      deliveredAmount: 0,
      OrderAmount: 0,
      buyerAmount: 0
    }
    // orderStatus = ['Ordered', 'Shipped', 'DeliveredToLoc', 'DeliveredHome', 'Distributor', 'Cancelled']

    this.productData$.getValue().forEach((product) => {
      total.OrderCount++;
      total.OrderAmount += product.costToMe;
      switch (product.status) {
        case 'Ordered':
          total.undeliveredCount++;
          total.undeliveredAmount += product.buyerPrice;
          break;
        case 'DeliveredHome' || 'DeliveredToLoc':
          total.deliveredCount++;
          total.deliveredAmount += product.buyerPrice;
          break;
        case 'Distributor':
          total.buyerCount++;
          total.buyerAmount += product.buyerPrice;
          break;
        default:
          break;
      }
    });

    this.statsData$.next(total);
  }

  getStats(): Observable<IProductStats> {
    return this.statsData$.asObservable();
  }

  getProducts(): Observable<IProduct[]> {
    return this.productData$.asObservable();
  }

  getUniqueProductNames(): Observable<string[]> {
    // const uniqueProductUrl = this.url + '/unique/' + field;
    return this.uniqueProductName$.asObservable();
  }

  getUniqueAppAccount(): Observable<string[]> {
    return this.uniqueAccountName$.asObservable();
  }

  getProduct(_id: string): IProduct {
    if (_id == 'new') return this.blankProduct();
    else {
      return this.productData$.getValue().find(p => p._id == _id)!;
    }
  }

  async addProduct(currentProduct: IProduct, addToCard = true) {
    try {
      const res: Iresult = await firstValueFrom(this.http.post<Iresult>(this.url, currentProduct));
      if (res.acknowledged) {
        this.commitService.updateEditDetails('orders');
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product ' + currentProduct.name + ' added.' });
        localStorage.removeItem(this.productStorageString);
        this.initialiseProductData();

        this.txnService.addTxnfromProduct(currentProduct);

        if (addToCard) {
          let updatedCard = this.cardService.getCard(currentProduct.cardHolder);
          updatedCard.unbilledAmount += currentProduct.cardAmount;
          updatedCard.totalAmount += currentProduct.cardAmount;
          if(currentProduct.cashback && currentProduct.cashback > 0){
            updatedCard.cashback = currentProduct.cashback;
          }
          this.cardService.updateCard(updatedCard);
        }
      } else {
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name });
        console.error('Unable to add Product ' + currentProduct.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unable to add Product ' + currentProduct.name + ' Error: ' + error.message });
      console.error('Unable to add Product ' + currentProduct.name + ' Error: ', error);
    }
  }

  async editProduct(currentProduct: IProduct, originalProduct: IProduct, init = true) {
    try {
      const res: Iresult = await firstValueFrom(this.http.put<Iresult>(this.url + '/' + currentProduct._id, currentProduct));
      if (res.acknowledged && res.modifiedCount) {
        this.commitService.updateEditDetails('orders');
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product ' + currentProduct.name + ' Updated.' });
        if (init) {
          localStorage.removeItem(this.productStorageString);
          this.initialiseProductData();
        }

        this.txnService.updateTxnUsingProduct(currentProduct, init);
        this.cardService.updateCardUsingProduct(currentProduct, originalProduct, init)

      } else {
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name });
        console.error('Unable to add Product ' + currentProduct.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Unable to add Product ' + currentProduct.name + ' Error: ' + error.message });
      console.error('Unable to add Product ' + currentProduct.name + ' Error: ', error);
    }

  }

  async deleteProduct(currentProduct: IProduct) {
    try {
      const res: Iresult = await firstValueFrom(this.http.delete<Iresult>(this.url + '/' + currentProduct._id));
      if (res.acknowledged) {
        this.commitService.updateEditDetails('orders');
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product ' + currentProduct.name + ' deleted.' });
        localStorage.removeItem(this.productStorageString);
        this.initialiseProductData();

        this.txnService.deleteTxn(currentProduct.txnId);

        let updatedCard = this.cardService.getCard(currentProduct.cardHolder);
        updatedCard.totalAmount -= currentProduct.cardAmount;
        if (updatedCard.unbilledAmount >= currentProduct.cardAmount) updatedCard.unbilledAmount -= currentProduct.cardAmount;
        this.cardService.updateCard(updatedCard);
      } else {
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Unable to delete Product ' + currentProduct.name });
        console.error('Unable to add Product ' + currentProduct.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unable to delete Product ' + currentProduct.name + ' Error: ' + error.message });
      console.error('Unable to add Product ' + currentProduct.name + ' Error: ', error);
    }
  }

  extractFieldArray(items: IProduct[], fieldName: string): string[] {
    let resArray: string[] = [];
    items.forEach((item: any) => {
      let field = item[fieldName];
      if (!(resArray.includes(field)))
        resArray.push(field);
    })
    return resArray;
  }

  blankProduct(): IProduct {
    return {
      _id: 'new',
      name: '',
      date: new Date().toISOString().slice(0, 10),
      ram: 4,
      storage: 128,
      color: 'Black',
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
