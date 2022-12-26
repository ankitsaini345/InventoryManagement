import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectId } from 'bson';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-modify',
  templateUrl: './card-modify.component.html',
  styleUrls: ['./card-modify.component.css']
})
export class CardModifyComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService) { }

  pageTitle = 'Edit Card';
  currentCard!: Icard;
  originalCard!: Icard;

  ngOnInit(): void {
    let name: string = this.route.snapshot.params['name'];
    if (name == 'new') this.pageTitle = 'Add Card';
    this.cardService.getCard(name).subscribe((data) => {
      this.currentCard = data;
      this.originalCard = data;
    })
  }

  saveCard() {
    if (this.currentCard.cardName == 'new') {
      this.currentCard._id = new ObjectId().toString()
      this.cardService.addCard(this.currentCard).subscribe({
        next: () => console.log(this.currentCard.cardName + ' saved.'),
        error: () => console.error('Error in saving card ' + this.currentCard.cardName)
      });
    } else {
      this.cardService.updateCard(this.currentCard).subscribe({
        next: () => console.log('Card ' + this.currentCard.cardName + ' edited.'),
        error: () => console.error('Error in editing card: ' + this.currentCard.cardName)
      })
    }
    console.log(this.currentCard);
    this.router.navigate(['/cards'])
  }

  resetCard() {
    this.currentCard.amountDue = 0;
    this.currentCard.billDate = 0;
    this.currentCard.dueDate = 0;
    this.currentCard.cardName = '';
  }
}
