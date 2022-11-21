import { Component, OnInit } from '@angular/core';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {
  cards: Icard[] = []
  constructor( private cardService: CardService) { }

  ngOnInit(): void {
    this.getCards();
  }

  getCards() {
    this.cardService.getCards().subscribe((data) => {
      this.cards = data;
    })
  }

  deleteCard(id: any) {
    this.cardService.deleteCard(id).subscribe(() => {
      console.log('card with id '+ id + ' deleted.');
      this.getCards();
    })
  }

}
