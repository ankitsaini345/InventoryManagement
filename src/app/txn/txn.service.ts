import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Itxn } from './transaction';

@Injectable({
  providedIn: 'root'
})
export class TxnService {

  constructor(private http: HttpClient) { }

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

  updateTxn(Txn: Itxn): Observable<Itxn> {
    return this.http.put<Itxn>(this.url + '/' + Txn._id, Txn);
  }

  deleteTxn(id: any): Observable<Itxn> {
    return this.http.delete<Itxn>(this.url + '/' + id);
  }
}
