import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Itxn } from '../transaction';
import { TxnService } from '../txn.service';

@Component({
  selector: 'app-txn-list',
  templateUrl: './txn-list.component.html',
  styleUrls: ['./txn-list.component.css']
})
export class TxnListComponent implements OnInit {

  cardName!: string;
  txns!: Itxn[];
  constructor(private route: ActivatedRoute,
    private txnService: TxnService) { }

  ngOnInit(): void {
    this.initialise();
  }

  async initialise() {
    this.cardName = this.route.snapshot.params['cname'];
    if (this.cardName == 'All') {
      this.txns = await firstValueFrom(this.txnService.getTxns());
    } else {
      this.txns = await firstValueFrom(this.txnService.getTxnByCard(this.cardName))
    }
  }

}
