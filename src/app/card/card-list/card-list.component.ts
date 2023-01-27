import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit, OnDestroy {
  filterBy = '';
  cards: Icard[] = []
  sub!: Subscription;
  aggregate: any = {};
  constructor( private cardService: CardService) { }

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    this.sub = this.cardService.getCards().subscribe((cards)=> {
      this.cards = cards;
    })
    this.calcTotal();
  }

  calcTotal() {
    this.aggregate = {};
    this.cards.forEach((item) => {
      this.aggregate.amountDue ? this.aggregate.amountDue += item.amountDue : this.aggregate.amountDue = item.amountDue;
      this.aggregate.totalAmount ? this.aggregate.totalAmount += item.totalAmount : this.aggregate.totalAmount = item.totalAmount;
    })
  }

  async deleteCard(card: Icard) {
    await this.cardService.deleteCard(card);
  }

  ngOnDestroy(): void {
   this.sub.unsubscribe();
  }
}
