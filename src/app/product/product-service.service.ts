import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { IProduct } from './product';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  constructor(private http: HttpClient) { }

  private url = environment.baseUrl + 'api/orders';
  
  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.url);
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

  addProduct(product: IProduct): Observable<any> {
    return this.http.post(this.url, product);
  }

  editProduct(product: IProduct): Observable<IProduct> {
    return this.http.put<IProduct>(this.url + '/' + product._id, product);
  }

  deleteProduct(id: number): Observable<IProduct[]> {
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
      listPrice: null,
      cardAmount: 0,
      costToMe: 0,
      buyerPrice: null,
      coupon: 0,
      giftBalence: 0,
      cardDiscount: 0,
      cardHolder: 'Ankit_AxisAce',
      deliveryDate: '',
      deliveryLoc: '',
      buyerDate: '',
      buyerName: 'AmtAryaNgr',
      profit: 0,
      txnId:''
    }
  }

}
