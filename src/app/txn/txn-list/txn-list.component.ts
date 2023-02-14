import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Itxn } from '../transaction';
import { TxnService } from '../txn.service';

@Component({
  selector: 'app-txn-list',
  templateUrl: './txn-list.component.html',
  styleUrls: ['./txn-list.component.css']
})
export class TxnListComponent implements OnInit, OnDestroy {

  filterBy = '';
  cardName!: string;
  txns!: Itxn[];
  subArray: Subscription[] = [];
  aggregate: any = {};
  cols: any[] = [];
  filteredValue: Itxn[] = [];

  constructor(private route: ActivatedRoute,
    private txnService: TxnService) { }


  ngOnInit(): void {
    this.initialise();
    this.initialiseCols();
  }

  onFilter(event: any) {
    this.filteredValue = event.filteredValue;
    this.calcTotal();
  }

  async initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      this.cardName = param['cname'];
      if (this.cardName == 'All') {
        let sub2: Subscription = this.txnService.getTxns().subscribe((txns) => {
          this.txns = txns;
          this.filteredValue = txns;
          this.calcTotal();
          this.cols = Object.keys(this.txns[0]);

        });
        this.subArray.push(sub2);
      } else {
        this.txns = this.txnService.getTxnByCard(this.cardName);
      }
    })
    this.subArray.push(sub1);
  }

  initialiseCols() {
    this.cols = [
      { field: 'OrderName', header: 'Product Name' },
      { field: 'txnDate', header: 'Date' },
      { field: 'cardName', header: 'Card' },
      { field: 'amount', header: 'Amount' }
    ];
  }

  calcTotal() {
    this.aggregate = {};
    this.filteredValue.forEach((item) => {
      this.aggregate.totalAmount ? this.aggregate.totalAmount += item.amount : this.aggregate.totalAmount = item.amount;
    })
  }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }
}
