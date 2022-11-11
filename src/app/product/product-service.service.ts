import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { IProduct } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  constructor(private http: HttpClient) { }

  private url = 'api/products';

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.url);
  }

  getProduct(id: number): Observable<IProduct> {
    if (id == 0) {
      return of(this.blankProduct());
    } else {
      // return this.getProducts().pipe(                                    // use in case of json file
      //   map((products: IProduct[]) => products.find(p => p.id == id))
      // );

      // for in mem db or backend service
      return this.http.get<IProduct>(this.url + '/' + id);
    }
  }

  addProducts(product: IProduct): Observable<IProduct[]> {
    product.id = null;
    return this.http.post<IProduct[]>(this.url, product);
  }

  editProducts(product: IProduct): Observable<IProduct[]> {
    return this.http.put<IProduct[]>(this.url + '/' + product.id, product);
  }

  deleteProducts(id: number): Observable<IProduct[]> {
    return this.http.delete<IProduct[]>(this.url + '/' + id);
  }

  blankProduct(): IProduct {
    return {
      id: 0,
      name: '',
      date: '',
      ram: 0,
      storage: 0,
      AppName: '',
      AppAccount: '',
      listPrice: 0,
      cardAmount: 0,
      costToMe: 0,
      dPrice: 0,
      coupon: 0,
      giftBalence: 0,
      cardDiscount: 0,
      cardHolder: '',
      deliveryDate: '',
      deliveryLoc: '',
      finalDelDate:'',
      distName: ''
    }
  }

}
