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
  constructor(private route: ActivatedRoute,
    private txnService: TxnService) { }


  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      this.cardName = param['cname'];
      if (this.cardName == 'All') {
        let sub2: Subscription = this.txnService.getTxns().subscribe((txns)=> {
          this.txns = txns;
        });
        this.subArray.push(sub2);
      } else {
        this.txns = await this.txnService.getTxnByCard(this.cardName);
      }
    })
    this.subArray.push(sub1);
  }

  ngOnDestroy(): void {
   this.subArray.forEach((sub: Subscription) => {
    sub.unsubscribe();
   })
  }
}
