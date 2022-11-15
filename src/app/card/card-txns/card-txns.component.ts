import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-txns',
  templateUrl: './card-txns.component.html',
  styleUrls: ['./card-txns.component.css']
})
export class CardTxnsComponent implements OnInit {
  card!: Icard;
  id: number;
  constructor(private cardService: CardService, private route: ActivatedRoute) {
    this.id = this.route.snapshot.params['id'];
   }

  ngOnInit(): void {
    this.getCards();
  }

  getCards() {
    this.cardService.getCard(this.id).subscribe((data) => {
      this.card = data;
      console.log(data);
    })
  }

}
