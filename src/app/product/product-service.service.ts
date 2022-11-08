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

  getProduct(id: number): Observable<IProduct | undefined>{
    if(id == 0) {
      return of(this.blankProduct());
    } else {
      return this.getProducts().pipe(
        map((products: IProduct[]) => products.find(p => p.id == id))
      );
    }
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
      cardHolder: '' 
    }
  }

}
