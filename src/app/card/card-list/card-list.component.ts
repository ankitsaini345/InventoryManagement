import { Component, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Icard } from '../card';
import { CardService } from '../card.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit, OnDestroy {
  filterBy = '';
  cards: Icard[] = []
  sub!: Subscription;
  aggregate: any = {};
  filteredValue: Icard[] = [];
  selectedCardOverlay: any = {
    card: {
      cardName: null
    },
    amount: 0,
    type: ''
  }

  constructor(private cardService: CardService,
    private confirmationService: ConfirmationService,
    private clipboard: Clipboard,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    this.sub = this.cardService.getCards().subscribe((cards) => {
      this.cards = cards;
      this.filteredValue = cards;
      this.calcTotal();
    })
  }

  customUpdate() {
    this.cards.forEach((card) => {
      // card.lastBilledMonth = 0;
      // this.cardService.updateCard(card, false);
    })
  }

  refresh() {
    this.cardService.refresh();
  }

  calcTotal() {
    this.aggregate = {};
    this.filteredValue.forEach((item) => {
      this.aggregate.unbilledAmount ? this.aggregate.unbilledAmount += item.unbilledAmount : this.aggregate.unbilledAmount = item.unbilledAmount;
      this.aggregate.amountDue ? this.aggregate.amountDue += item.amountDue : this.aggregate.amountDue = item.amountDue;
      this.aggregate.totalAmount ? this.aggregate.totalAmount += item.totalAmount : this.aggregate.totalAmount = item.totalAmount;
    })
  }

  onFilter(event: any) {
    this.filteredValue = event.filteredValue;
    this.calcTotal();
  }

  async deleteCard(event: Event, card: Icard) {
    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you delete card: ' + card.cardName,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: card.cardName + ' marked for deletion.',
        });
        await this.cardService.deleteCard(card);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Card deletion Cancelled.',
        });
      },
    });
  }

  async markAsPaid(status: boolean) {

    if (status) {
      if (this.selectedCardOverlay.type == 'Remaining Amount')
        this.selectedCardOverlay.card.amountDue = +this.selectedCardOverlay.amount;
      else this.selectedCardOverlay.card.amountDue -= +this.selectedCardOverlay.amount;
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: this.selectedCardOverlay.card.cardName + ' marked for Updation.',
      });
      this.cardService.updateCard(this.selectedCardOverlay.card);
    }

    this.selectedCardOverlay = {
      card: {
        cardName: null
      },
      amount: 0,
      type: ''
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  copyCardNum(card: Icard) {
    if (this.clipboard.copy(card.cardNumber))
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: card.cardName + ' number copied',
      });
    else console.log('Error in copying card number');
  }
}
