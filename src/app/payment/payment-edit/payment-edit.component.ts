import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectId } from 'bson';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Icard } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
import { IPayee } from '../payee';
import { PayeeService } from '../payee.service';
import { IPayment } from '../payment';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-payment-edit',
  templateUrl: './payment-edit.component.html',
  styleUrls: ['./payment-edit.component.css']
})
export class PaymentEditComponent implements OnInit {
  subArray: Subscription[] = []
  mode = ["phonePe", "Gpay", "Paytm", "Cash", "Card", "LIC", "Others"];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private payeeService: PayeeService,
    private cardService: CardService,
    private messageService: MessageService,
    private paymentService: PaymentService) { }

  pageTitle = 'Edit Payment';
  currentPayment!: IPayment;
  originalPayment!: IPayment;
  payeeNameArray!: string[];
  filteredPayeeNameArray: string[] = [];
  receiverNameArray!: string[];
  filteredReceiverNameArray: string[] = [];
  cardNameArray: string[] = [];
  filteredCardArray: string[] = [];
  loading = false;
  addPaymentToCard = false;
  payee!: IPayee;

  get name() {
    return this.currentPayment.name;
  }

  get amount() {
    return this.currentPayment.amount;
  }

  get type() {
    return this.currentPayment.type;
  }

  set amount(val: number) {
    this.currentPayment.amount = val;
    if (this.currentPayment.type == 'in')
      this.currentPayment.remAmount = this.currentPayment.prevAmount - this.currentPayment.amount;
    else if (this.currentPayment.type == 'out')
      this.currentPayment.remAmount = this.currentPayment.prevAmount + this.currentPayment.amount;
  }

  set type(val: string) {
    this.currentPayment.type = val;
    if (this.currentPayment.type == 'in')
      this.currentPayment.remAmount = this.currentPayment.prevAmount - this.currentPayment.amount;
    else if (this.currentPayment.type == 'out')
      this.currentPayment.remAmount = this.currentPayment.prevAmount + this.currentPayment.amount;
  }

  set name(val: string) {
    if (val) {
      this.currentPayment.name = val;
      this.payee = this.payeeService.getPayeeByName(val);
      this.currentPayment.prevAmount = this.payee.totalAmount;
      this.currentPayment.lastPayDate = this.payee.lastPaymentDate;
      if (this.currentPayment._id == 'new')
        this.currentPayment.count = this.payee.lastPaymentNum + 1
      else
        this.currentPayment.count = this.payee.lastPaymentNum;
    }
    if (this.currentPayment.type == 'in')
      this.currentPayment.remAmount = this.currentPayment.prevAmount - this.currentPayment.amount;
    else if (this.currentPayment.type == 'out')
      this.currentPayment.remAmount = this.currentPayment.prevAmount + this.currentPayment.amount;
  }

  set cashback(val: number) {
    if(val) {
      this.currentPayment.cashback = Math.round((this.currentPayment.amount * val) / 100);
    } else this.currentPayment.cashback = 0;
  }

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      let _id: string = param['_id'];
      if (_id == 'new') this.pageTitle = 'Add Payment';
      this.currentPayment = this.paymentService.getPaymentbyId(_id);
      this.originalPayment = { ...this.currentPayment };
    })
    this.subArray.push(sub1);

    let sub2: Subscription = this.paymentService.getUniqueReceiver().subscribe((data: string[]) => {
      this.receiverNameArray = this.filteredReceiverNameArray = data;
    });
    this.subArray.push(sub2);

    let sub3: Subscription = this.payeeService.getUniquePayeeNames().subscribe((data: string[]) => {
      this.payeeNameArray = this.filteredPayeeNameArray = data;
    });
    this.subArray.push(sub3);


    let sub4: Subscription = this.cardService.getCardNames().subscribe((cardName: string[]) => {
      this.cardNameArray = cardName;
    });
    this.subArray.push(sub4);
  }

  async save() {

    if (!this.payee) {
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Payee not selected.' });
      return;
    }
    this.loading = true;
    if (this.currentPayment._id == 'new') {
      this.currentPayment._id = new ObjectId().toString();
      this.paymentService.addPayment(this.currentPayment);
    } else {
      this.paymentService.updatePayment(this.currentPayment);
    }
    this.payee.pendingComm += this.currentPayment.cashback;
    this.payee.totalAmount = this.currentPayment.remAmount;
    this.payeeService.editPayee(this.payee);

    if (this.addPaymentToCard && this.currentPayment.paymentMode == 'Card') {
      let card = this.cardService.getCard(this.currentPayment.receiver);
      card.amountDue -= this.currentPayment.amount;
      this.cardService.updateCard(card);
    }
    this.loading = false;
    this.router.navigate(['/payments/All'])
  }

  reset() {
    this.initialise();
  }

  filterPayee(event: any) {
    this.filteredPayeeNameArray = [];
    let query = event.query;
    if (query) {
      for (let i = 0; i < this.payeeNameArray.length; i++) {
        let product = this.payeeNameArray[i];
        if (product.toLowerCase().indexOf(query.toLowerCase()) > -1) {
          this.filteredPayeeNameArray.push(product);
        }
      }
    } else {
      this.filteredPayeeNameArray = this.payeeNameArray.slice();
    }
  }

  filterReceiver(event: any) {
    this.filteredReceiverNameArray = [];
    let query = event.query;
    if (this.currentPayment.paymentMode == 'Card') {
      if (query) {
        for (let i = 0; i < this.cardNameArray.length; i++) {
          let name = this.cardNameArray[i];
          if (name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            this.filteredReceiverNameArray.push(name);
          }
        }
      } else this.filteredReceiverNameArray = this.cardNameArray.slice();
    } else {
      if (query) {
        for (let i = 0; i < this.receiverNameArray.length; i++) {
          let name = this.receiverNameArray[i];
          if (name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
            this.filteredReceiverNameArray.push(name);
          }
        }
      } else this.filteredReceiverNameArray = this.receiverNameArray.slice();
    }
  }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }
}

