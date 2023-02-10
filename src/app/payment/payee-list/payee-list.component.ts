import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription, async } from 'rxjs';
import { IPayee } from '../payee';
import { PayeeService } from '../payee.service';

@Component({
  selector: 'app-payee-list',
  templateUrl: './payee-list.component.html',
  styleUrls: ['./payee-list.component.css']
})
export class PayeeListComponent implements OnInit, OnDestroy {
  filterBy = '';
  payees: IPayee[] = []
  sub!: Subscription;
  aggregate: any = {};
    
    constructor( private payeeService: PayeeService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService) { }

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    this.sub = this.payeeService.getPayees().subscribe((payees)=> {
      this.payees = payees;
    })
    // this.calcTotal();
  }

  // calcTotal() {
  //   this.aggregate = {};
  //   this.payees.forEach((item) => {
  //     this.aggregate.amountDue ? this.aggregate.amountDue += item.amountDue : this.aggregate.amountDue = item.amountDue;
  //     this.aggregate.totalAmount ? this.aggregate.totalAmount += item.totalAmount : this.aggregate.totalAmount = item.totalAmount;
  //   })
  // }

  async deletePayee(event: Event, payee: IPayee) {

    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you delete payee: ' + payee.name,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: payee.name + ' marked for deletion.',
        });
        await this.payeeService.deletePayee(payee);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Payee deletion Cancelled.',
        });
      },
    });
  }

  async markAsPaid(event: Event, payee: IPayee) {

    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure to mark paid for: ' + payee.name,
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: payee.name + ' marked for Updation.',
        });
        payee.totalAmount = 0;
        await this.payeeService.editPayee(payee);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Payee Updation Cancelled.',
        });
      },
    });
  }

  ngOnDestroy(): void {
   this.sub.unsubscribe();
  }
}
