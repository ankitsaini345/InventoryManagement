import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Icard, IcardTxn } from './card';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(private http: HttpClient) { }

  private url = environment.baseUrl + 'api/cards'

  getCards(): Observable<Icard[]> {
    return this.http.get<Icard[]>(this.url);
  }

  getCardByName(name: string): Observable<Icard[]> {
    return this.http.get<Icard[]>(this.url + '?cardName=' + name);
  }

  getCard(id: number): Observable<Icard> {
    if (id == 0) return of(this.blankCard());
    return this.http.get<Icard>(this.url + '/' + id);
  }

  addCard(card: Icard): Observable<Icard> {
    card.id = null;
    return this.http.post<Icard>(this.url, card);
  }

  updateCard(card: Icard): Observable<Icard> {
    return this.http.put<Icard>(this.url + '/' + card.id, card);
  }

  deleteCard(id: any): Observable<Icard> {
    return this.http.delete<Icard>(this.url + '/' + id);
  }

  async addCardTxn(cardName: string, txn: IcardTxn) {
    let card = await firstValueFrom(this.getCardByName(cardName));
    if(card.length > 0) {
      card[0].txns?.push(txn);
      return firstValueFrom(this.updateCard(card[0]));
    } else {
      throw new Error("Card not Found");
    }
  }

  blankCard(): Icard {
    return {
      id: 0,
      cardName: '',
      dueDate: 0,
      amountDue: 0,
      billDate: 0
    }
  }

}
