import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    let id: string = this.route.snapshot.params['id'];
    if (id == 'new') this.pageTitle = 'Add Card';
    this.cardService.getCard(id).subscribe((data) => {
      this.currentCard = data;
      this.originalCard = data;
    })
  }

  saveCard() {
    console.log(this.currentCard);
    if (this.currentCard._id == 'new') {
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
    this.router.navigate(['/cards'])
  }

  resetCard() {
    this.currentCard.amountDue = 0;
    this.currentCard.billDate = 0;
    this.currentCard.dueDate = 0;
    this.currentCard.cardName = '';
  }
}
