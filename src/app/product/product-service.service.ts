import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

  constructor(private http: HttpClient) { }

  private url = 'assets/data/products.json';

  getProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.url);
  }

}
