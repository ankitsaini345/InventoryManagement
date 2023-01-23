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
  private txnStorageString = 'inventoryTxns';
  private cardStorageString = 'inventoryCards';

  async getTxns(): Promise<Itxn[]> {
    // return this.http.get<Itxn[]>(this.url);
    let txns = localStorage.getItem(this.txnStorageString);
    let txnArray: Itxn[];
    if (txns) {
      txnArray = JSON.parse(txns);
    } else {
      txnArray = await firstValueFrom(this.http.get<Itxn[]>(this.url));
      localStorage.setItem(this.txnStorageString, JSON.stringify(txnArray));
    }
    return txnArray;
  }

  // getTxnByCardName(name: string): Observable<Itxn[]> {
  //   return this.http.get<Itxn[]>(this.url + '?TxnName=' + name);
  // }

  async getTxn(id: string): Promise<Itxn> {
    // return this.http.get<Itxn>(this.url + '?id=' + id);

    let txnArray = await this.getTxns();
    let txn = txnArray.find(p => p._id == id);
    return txn!;
  }

  async getTxnByCard(cname: string): Promise<Itxn[]> {
    // return this.http.get<Itxn[]>(this.url + '/' + cname);

    let txnArray = await this.getTxns();
    let txn = txnArray.filter(p => p.cardName == cname);
    return txn!;
  }

  addTxn(Txn: Itxn): Observable<Itxn> {
    localStorage.removeItem(this.txnStorageString);
    localStorage.removeItem(this.cardStorageString);
    return this.http.post<Itxn>(this.url, Txn);
  }

  async addTxnfromProduct(product: IProduct) {
    localStorage.removeItem(this.txnStorageString);
    localStorage.removeItem(this.cardStorageString);
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
    localStorage.removeItem(this.txnStorageString);
    localStorage.removeItem(this.cardStorageString);
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
    localStorage.removeItem(this.txnStorageString);
    localStorage.removeItem(this.cardStorageString);
    return this.http.put<Itxn>(this.url + '/' + Txn._id, Txn);
  }

  deleteTxn(id: any): Observable<Itxn> {
    localStorage.removeItem(this.txnStorageString);
    localStorage.removeItem(this.cardStorageString);
    return this.http.delete<Itxn>(this.url + '/' + id);
  }
}
