import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
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
  sub1!: Subscription;
  constructor(private route: ActivatedRoute,
    private txnService: TxnService) { }


  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    this.sub1 = this.route.params.subscribe(async (param) => {
      this.cardName = param['cname'];
      if (this.cardName == 'All') {
        this.txns = await firstValueFrom(this.txnService.getTxns());
      } else {
        this.txns = await firstValueFrom(this.txnService.getTxnByCard(this.cardName))
      }
    })

  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
  }

}
