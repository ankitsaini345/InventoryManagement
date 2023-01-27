import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Icard } from './card';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private cardStorageString = 'inventoryCards';
  private txnStorageString = 'inventoryTxns';
  private url = environment.baseUrl + 'api/cards'

  private cardData$ = new BehaviorSubject<Icard[]>([]);

  constructor(private http: HttpClient,
    private messageService: MessageService) {
    this.initialiseCardData();
  }

  getCards(): Observable<Icard[]> {
    return this.cardData$.asObservable();
  }

  async initialiseCardData() {
    let cards = localStorage.getItem(this.cardStorageString);
    let cardsArray: Icard[];
    if (cards) {
      cardsArray = JSON.parse(cards);
      this.cardData$.next(cardsArray);
    } else {
      cardsArray = await firstValueFrom(this.http.get<Icard[]>(this.url));
      localStorage.setItem(this.cardStorageString, JSON.stringify(cardsArray));
      this.cardData$.next(cardsArray);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Cards Data Initialised' });
    }
  }

  async getCard(cardName: string): Promise<Icard> {
    if (cardName == 'new') return this.blankCard();
    else {
      let cards = await firstValueFrom(this.getCards());
      let card = cards.find(p => p.cardName == cardName);
      return card!;
    }
    // return this.http.get<Icard>(this.url + '/' + cardName);
  }

  async getCardById(_id: string): Promise<Icard> {
    if (_id == 'new') return this.blankCard();
    else {
      let cards = await firstValueFrom(this.getCards());
      let card = cards.find(p => p._id == _id);
      return card!;
    }
    // return this.http.get<Icard>(this.url + '/' + cardName);
  }

  async addCard(card: Icard) {
    try {
      let res: any = await firstValueFrom(this.http.post(this.url, card));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Card: ' + card.cardName + ' added.' });
        localStorage.removeItem(this.cardStorageString);
        this.initialiseCardData();
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to add card: ' + card.cardName + ' Error: ' + error.message });
    }
  }

  async updateCard(card: Icard) {
    try {
      let res: any = await firstValueFrom(this.http.put(this.url + '/' + card._id, card));
      if (res.acknowledged) {
        if (res.matchedCount && res.modifiedCount) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Card: ' + card.cardName + ' Updated.' });
          localStorage.removeItem(this.cardStorageString);
          this.initialiseCardData();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: card.cardName + ': Not matched with any existing card' });
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to update card: ' + card.cardName + ' Error: ' + error.message });
    }
  }

  async deleteCard(card: Icard) {
    try {
      let res: any = await firstValueFrom(this.http.delete<Icard>(this.url + '/' + card._id));
      if (res.acknowledged && res.deletedCount) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Card: ' + card.cardName + ' deleted.' });
        localStorage.removeItem(this.cardStorageString);
        this.initialiseCardData();
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete card: ' + card.cardName + ' Error: ' + error.message });
    }
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
