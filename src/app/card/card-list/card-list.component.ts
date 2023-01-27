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
  constructor( private cardService: CardService) { }

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    this.sub = this.cardService.getCards().subscribe((cards)=> {
      this.cards = cards;
    })
  }

  async deleteCard(card: Icard) {
    await this.cardService.deleteCard(card);
  }

  ngOnDestroy(): void {
   this.sub.unsubscribe();
  }
}
