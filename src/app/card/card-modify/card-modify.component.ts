import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectId } from 'bson';
import { Subscription } from 'rxjs';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-modify',
  templateUrl: './card-modify.component.html',
  styleUrls: ['./card-modify.component.scss']
})
export class CardModifyComponent implements OnInit {
  subArray: Subscription[] = []

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService) { }

  pageTitle = 'Edit Card';
  currentCard!: Icard;
  originalCard!: Icard;
  loading = false;

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      let _id: string = param['_id'];
      if (_id == 'new') this.pageTitle = 'Add Card';
      this.currentCard = await this.cardService.getCardById(_id);
      this.originalCard = { ...this.currentCard };
    })
    this.subArray.push(sub1);
  }

  async saveCard() {
    this.loading = true;
    if (this.currentCard._id == 'new') {
      this.currentCard._id = new ObjectId().toString();
      await this.cardService.addCard(this.currentCard);
    } else {
      await this.cardService.updateCard(this.currentCard);
    }
    this.router.navigate(['/cards'])
  }

  resetCard() {
    this.currentCard.amountDue = 0;
    this.currentCard.billDate = 0;
    this.currentCard.dueDate = 0;
    this.currentCard.cardName = '';
  }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }
}
