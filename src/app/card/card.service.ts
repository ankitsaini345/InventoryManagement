import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Icard } from './card';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(private http: HttpClient) { }

  private cardStorageString = 'inventoryCards';
  private txnStorageString = 'inventoryTxns';
  private url = environment.baseUrl + 'api/cards'

  async getCards(): Promise<Icard[]> {
    // return this.http.get<Icard[]>(this.url);

    let cards = localStorage.getItem(this.cardStorageString);
    let cardsArray: Icard[];
    if (cards) {
      cardsArray = JSON.parse(cards);
    } else {
      cardsArray = await firstValueFrom(this.http.get<Icard[]>(this.url));
      localStorage.setItem(this.cardStorageString, JSON.stringify(cardsArray));
    }
    return cardsArray;
  }

  async getCard(cardName: string): Promise<Icard> {
    if (cardName == 'new') return this.blankCard();
    else {
      let cardsArray = await this.getCards();
      let card = cardsArray.find(p => p.cardName == cardName);
      return card!;
    }
    // return this.http.get<Icard>(this.url + '/' + cardName);
  }

  addCard(card: Icard): Observable<Icard> {
    localStorage.removeItem(this.cardStorageString);
    localStorage.removeItem(this.txnStorageString);
    return this.http.post<Icard>(this.url, card);
  }

  updateCard(card: Icard): Observable<Icard> {
    localStorage.removeItem(this.cardStorageString);
    localStorage.removeItem(this.txnStorageString);
    return this.http.put<Icard>(this.url + '/' + card._id, card);
  }

  deleteCard(id: any): Observable<Icard> {
    localStorage.removeItem(this.cardStorageString);
    localStorage.removeItem(this.txnStorageString);
    return this.http.delete<Icard>(this.url + '/' + id);
  }

  blankCard(): Icard {
    return {
      _id: 'new',
      cardName: '',
      dueDate: 0,
      amountDue: 0,
      billDate: 0,
      totalAmount: 0
    }
  }

}
