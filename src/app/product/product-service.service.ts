import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { IProduct } from './product';
import { environment } from 'src/environments/environment';
import { CardService } from '../card/card.service';
import { ToastrService } from 'ngx-toastr';
import { TxnService } from '../txn/txn.service';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  constructor(private http: HttpClient,
    private cardService: CardService,
    private txnService: TxnService,
    private toastService: ToastrService,
  ) { }

  private url = environment.baseUrl + 'api/orders';

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.url);
  }

  getUniqueProducts(field: string) {
    const uniqueProductUrl = environment.useInMemDB ? 'api/uniqueOrders' : this.url + '/unique/' + field;
    return this.http.get(uniqueProductUrl);
  }

  getProduct(id: string): Observable<IProduct> {
    if (id == 'new') {
      return of(this.blankProduct());
    } else {
      // return this.getProducts().pipe(                                    // use in case of json file
      //   map((products: IProduct[]) => products.find(p => p.id == id))
      // );

      // for in mem db or backend service
      return this.http.get<IProduct>(this.url + '/' + id);
    }
  }

  async addProduct(currentProduct: IProduct) {
    await firstValueFrom(this.http.post(this.url, currentProduct));
    this.toastService.success('Product ' + currentProduct.name + ' added.')
    await this.txnService.addTxnfromProduct(currentProduct);
    this.toastService.success('Product ' + currentProduct.name + ' added in Txns')
    let cardInfo = await firstValueFrom(this.cardService.getCard(currentProduct.cardHolder));
    cardInfo.amountDue += currentProduct.cardAmount;
    cardInfo.totalAmount += currentProduct.cardAmount;
    await firstValueFrom(this.cardService.updateCard(cardInfo));
    this.toastService.success('Amount for ' + currentProduct.name + ' Updated in ' + currentProduct.cardHolder)
  }

  async editProduct(currentProduct: IProduct, originalProduct: IProduct) {
    await firstValueFrom(this.http.put<IProduct>(this.url + '/' + currentProduct._id, currentProduct))
    if (currentProduct.cardAmount != originalProduct.cardAmount) {
      await this.txnService.updateTxnUsingProduct(currentProduct);
      let cardInfo = await firstValueFrom(this.cardService.getCard(currentProduct.cardHolder));
      cardInfo.amountDue -= originalProduct.cardAmount;
      cardInfo.amountDue += currentProduct.cardAmount;
      cardInfo.totalAmount -= originalProduct.cardAmount;
      cardInfo.totalAmount += currentProduct.cardAmount;
      await firstValueFrom(this.cardService.updateCard(cardInfo));
    }

  }

  deleteProduct(id: string): Observable<IProduct[]> {
    return this.http.delete<IProduct[]>(this.url + '/' + id);
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
