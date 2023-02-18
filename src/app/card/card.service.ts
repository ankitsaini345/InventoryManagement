import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Iresult } from '../product/Iresult';
import { IProduct } from '../product/product';
import { Icard } from './card';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private cardStorageString = 'inventoryCards';
  private txnStorageString = 'inventoryTxns';
  private url = environment.baseUrl + 'api/cards'

  private cardData$ = new BehaviorSubject<Icard[]>([]);
  private cardNameArray$ = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient,
    private messageService: MessageService) {
    // this.initialiseCardData();
  }

  getCards(): Observable<Icard[]> {
    return this.cardData$.asObservable();
  }

  getCardNames(): Observable<string[]> {
    return this.cardNameArray$.asObservable();
  }

  async initialiseCardData() {
    let cards = sessionStorage.getItem(this.cardStorageString);
    let cardsArray: Icard[];
    if (cards) {
      cardsArray = JSON.parse(cards);
      this.cardData$.next(cardsArray);
    } else {
      cardsArray = await firstValueFrom(this.http.get<Icard[]>(this.url));
      sessionStorage.setItem(this.cardStorageString, JSON.stringify(cardsArray));
      this.cardData$.next(cardsArray);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Cards Data Initialised' });
    }
    let cardNames: string[] = [];
    cardsArray.forEach((card: Icard)=> {
      cardNames.push(card.cardName);
    })
    this.cardNameArray$.next(cardNames);
  }

  getCard(cardName: string): Icard {
    if (cardName == 'new') return this.blankCard();
    else {
      return this.cardData$.getValue().find(p => p.cardName == cardName)!;
    }
    // return this.http.get<Icard>(this.url + '/' + cardName);
  }

  getCardById(_id: string): Icard {
    if (_id == 'new') return this.blankCard();
    else {
      return this.cardData$.getValue().find(p => p._id == _id)!;
    }
    // return this.http.get<Icard>(this.url + '/' + cardName);
  }

  async addCard(card: Icard, init = true) {
    try {
      let res: Iresult = await firstValueFrom(this.http.post<Iresult>(this.url, card));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Card: ' + card.cardName + ' added.' });
        if (init) {
          sessionStorage.removeItem(this.cardStorageString);
          this.initialiseCardData();
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to add card: ' + card.cardName + ' Error: ' + error.message });
    }
  }

  async updateCard(card: Icard, init = true) {
    try {
      let res: Iresult = await firstValueFrom(this.http.put<Iresult>(this.url + '/' + card._id, card));
      if (res.acknowledged) {
        if (res.matchedCount && res.modifiedCount) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Card: ' + card.cardName + ' Updated.' });
          if (init) {
            sessionStorage.removeItem(this.cardStorageString);
            this.initialiseCardData();
          }
        } else if (!res.modifiedCount) {
          this.messageService.add({ severity: 'info', summary: 'Info', detail: card.cardName + ': Nothing to update.' });

        } else {
          console.error(card.cardName + ': Not matched with any existing card');
          this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: card.cardName + ': Not matched with any existing card' });
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to update card: ' + card.cardName + ' Error: ' + error.message });
    }
  }

  async updateCardUsingProduct(currentProduct: IProduct, originalProduct: IProduct, init = true) {

    if (currentProduct.cardHolder != originalProduct.cardHolder) {
      let oldCard = this.getCard(originalProduct.cardHolder);
      oldCard.amountDue -= originalProduct.cardAmount;
      if (!oldCard.amountDue) oldCard.amountDue = 0;
      oldCard.totalAmount -= originalProduct.cardAmount;
      this.updateCard(oldCard, init);

      let newCard = this.getCard(currentProduct.cardHolder);
      newCard.totalAmount += currentProduct.cardAmount;
      newCard.amountDue += currentProduct.cardAmount;
      this.updateCard(newCard, init);

    } else if (currentProduct.cardAmount != originalProduct.cardAmount) {
      let oldCard = this.getCard(originalProduct.cardHolder);
      oldCard.amountDue -= originalProduct.cardAmount;
      oldCard.totalAmount -= originalProduct.cardAmount;

      oldCard.totalAmount += currentProduct.cardAmount;
      oldCard.amountDue += currentProduct.cardAmount;
      this.updateCard(oldCard, init);
    }
  }

  async deleteCard(card: Icard, init = true) {
    try {
      let res: Iresult = await firstValueFrom(this.http.delete<Iresult>(this.url + '/' + card._id));
      if (res.acknowledged && res.deletedCount) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Card: ' + card.cardName + ' deleted.' });
        if (init) {
          sessionStorage.removeItem(this.cardStorageString);
          this.initialiseCardData();
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to delete card: ' + card.cardName + ' Error: ' + error.message });
    }
  }

  blankCard(): Icard {
    return {
      _id: 'new',
      cardName: '',
      cardNumber: '',
      dueDate: 0,
      amountDue: 0,
      billDate: 0,
      totalAmount: 0
    }
  }

}
