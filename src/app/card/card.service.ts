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

  private url = environment.baseUrl + 'api/cards'

  getCards(): Observable<Icard[]> {
    return this.http.get<Icard[]>(this.url);
  }

  getCard(cardName: string): Observable<Icard> {
    if (cardName == 'new') return of(this.blankCard());
    return this.http.get<Icard>(this.url + '/' + cardName);
  }

  addCard(card: Icard): Observable<Icard> {
    return this.http.post<Icard>(this.url, card);
  }

  updateCard(card: Icard): Observable<Icard> {
    return this.http.put<Icard>(this.url + '/' + card._id, card);
  }

  deleteCard(id: any): Observable<Icard> {
    return this.http.delete<Icard>(this.url + '/' + id);
  }

  blankCard(): Icard {
    return {
      _id: 'new',
      cardName: '',
      dueDate: 0,
      amountDue: 0,
      billDate: 0
    }
  }

}
