import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectId } from 'bson';
import { Subscription } from 'rxjs';
import { Icard } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
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
  mode = ["phonePe", "Gpay", "Paytm", "Cash", "Card", "Others"];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private payeeService: PayeeService,
    private cardService: CardService,
    private paymentService: PaymentService) { }

  pageTitle = 'Edit Payment';
  currentPayment!: IPayment;
  originalPayment!: IPayment;
  payeeNameArray!: string[];
  filteredPayeeNameArray!: string[];
  receiverNameArray!: string[];
  filteredReceiverNameArray!: string[];
  cardNameArray: string[] = [];
  filteredCardArray: string[] = [];
  loading = false;

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

    let sub4: Subscription = this.cardService.getCards().subscribe((cards: Icard[]) => {
      cards.forEach((card) => {
        this.cardNameArray.push(card.cardName)
      })
      this.filteredCardArray = this.cardNameArray;
    });
    this.subArray.push(sub4);

  }

  async save() {
    this.loading = true;
    if (this.currentPayment._id == 'new') {
      this.currentPayment._id = new ObjectId().toString();
      await this.paymentService.addPayment(this.currentPayment);
    } else {
      await this.paymentService.updatePayment(this.currentPayment);
    }
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
    if (query) {
      for (let i = 0; i < this.receiverNameArray.length; i++) {
        let product = this.receiverNameArray[i];
        if (product.toLowerCase().indexOf(query.toLowerCase()) > -1) {
          this.filteredReceiverNameArray.push(product);
        }
      }
    } else {
      this.filteredReceiverNameArray = this.receiverNameArray.slice();
    }
  }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }
}

