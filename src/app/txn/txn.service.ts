import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Icard } from '../card/card';
import { Iresult } from '../product/Iresult';
import { IProduct } from '../product/product';
import { Itxn } from './transaction';

@Injectable({
  providedIn: 'root'
})
export class TxnService {

  private url = environment.baseUrl + 'api/txns'
  private txnStorageString = 'inventoryTxns';
  private cardStorageString = 'inventoryCards';

  private txnData$ = new BehaviorSubject<Itxn[]>([]);

  constructor(private http: HttpClient,
    private messageService: MessageService) {
    this.initialiseTxnData();
  }

  getTxns(): Observable<Itxn[]> {
    return this.txnData$.asObservable();
  }

  async initialiseTxnData() {
    let txns = sessionStorage.getItem(this.txnStorageString);
    let txnsArray: Itxn[];
    if (txns) {
      txnsArray = JSON.parse(txns);
      this.txnData$.next(txnsArray);
    } else {
      txnsArray = await firstValueFrom(this.http.get<Itxn[]>(this.url));
      sessionStorage.setItem(this.txnStorageString, JSON.stringify(txnsArray));
      this.txnData$.next(txnsArray);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Txn Data Initialised' });
    }
  }

  getTxn(id: string): Itxn {
    return this.txnData$.getValue().find(p => p._id == id)!;
    // return this.http.get<Itxn>(this.url + '?id=' + id);
  }

  getTxnByCard(cname: string): Itxn[] {
    return this.txnData$.getValue().filter(p => p.cardName == cname)!;
    // return this.http.get<Itxn[]>(this.url + '/' + cname);
  }

  async addTxn(Txn: Itxn) {
    try {
      let res: Iresult = await firstValueFrom(this.http.post<Iresult>(this.url, Txn));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Txn: ' + Txn.OrderName + ' added.' });
        sessionStorage.removeItem(this.txnStorageString);
        this.initialiseTxnData();
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to add txn: ' + Txn.OrderName + ' Error: ' + error.message });
    }
  }

  async addTxnfromProduct(product: IProduct) {
    const txn: Itxn = {
      _id: product.txnId,
      amount: product.cardAmount,
      orderId: product._id,
      txnDate: product.date,
      cardName: product.cardHolder,
      OrderName: product.name
    }
    await this.addTxn(txn);
  }

  async updateTxnUsingProduct(product: IProduct) {
    const txn: Itxn = {
      _id: product.txnId,
      amount: product.cardAmount,
      orderId: product._id,
      txnDate: product.date,
      cardName: product.cardHolder,
      OrderName: product.name
    }
    await this.updateTxn(txn);
  }

  async updateTxn(Txn: Itxn) {
    try {
      let res: Iresult = await firstValueFrom(this.http.put<Iresult>(this.url + '/' + Txn._id, Txn));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Txn: ' + Txn.OrderName + ' updated.' });
        sessionStorage.removeItem(this.txnStorageString);
        this.initialiseTxnData();
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to update txn: ' + Txn.OrderName + ' Error: ' + error.message });
    }
  }

  async deleteTxn(_id: string) {
    try {
      let res: Iresult = await firstValueFrom(this.http.delete<Iresult>(this.url + '/' + _id));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Txn: ' + _id + ' deleted.' });
        sessionStorage.removeItem(this.txnStorageString);
        this.initialiseTxnData();
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete txn: ' + _id + ' Error: ' + error.message });
    }
  }
}
