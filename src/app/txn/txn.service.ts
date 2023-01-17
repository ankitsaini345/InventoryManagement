import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IProduct } from '../product/product';
import { Itxn } from './transaction';

@Injectable({
  providedIn: 'root'
})
export class TxnService {

  constructor(private toastService: ToastrService,
    private http: HttpClient) { }

  private url = environment.baseUrl + 'api/txns'

  getTxns(): Observable<Itxn[]> {
    return this.http.get<Itxn[]>(this.url);
  }

  // getTxnByCardName(name: string): Observable<Itxn[]> {
  //   return this.http.get<Itxn[]>(this.url + '?TxnName=' + name);
  // }

  getTxn(id: string): Observable<Itxn> {
    return this.http.get<Itxn>(this.url + '?id=' + id);
  }

  getTxnByCard(cname: string): Observable<Itxn[]> {
    return this.http.get<Itxn[]>(this.url + '/' + cname);
  }

  addTxn(Txn: Itxn): Observable<Itxn> {
    return this.http.post<Itxn>(this.url, Txn);
  }

  async addTxnfromProduct(product: IProduct) {
    try {
      const txn: Itxn = {
        _id: product.txnId,
        amount: product.cardAmount,
        orderId: product._id,
        txnDate: product.date,
        cardName: product.cardHolder,
        OrderName: product.name
      }
      await firstValueFrom(this.addTxn(txn));
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  async updateTxnUsingProduct(product: IProduct) {
    try {
      const txn: Itxn = {
        _id: product.txnId,
        amount: product.cardAmount,
        orderId: product._id,
        txnDate: product.date,
        cardName: product.cardHolder,
        OrderName: product.name
      }
      await firstValueFrom(this.updateTxn(txn));
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  updateTxn(Txn: Itxn): Observable<Itxn> {
    return this.http.put<Itxn>(this.url + '/' + Txn._id, Txn);
  }

  deleteTxn(id: any): Observable<Itxn> {
    return this.http.delete<Itxn>(this.url + '/' + id);
  }
}
