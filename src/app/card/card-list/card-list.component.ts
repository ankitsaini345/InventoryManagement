import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {
  filterBy = '';
  cards: Icard[] = []
  constructor( private cardService: CardService) { }

  ngOnInit(): void {
    this.getCards();
  }

  async getCards() {
    this.cards = await firstValueFrom(this.cardService.getCards());
  }

  deleteCard(id: any) {
    this.cardService.deleteCard(id).subscribe(() => {
      console.log('card with id '+ id + ' deleted.');
      this.getCards();
    })
  }

}
