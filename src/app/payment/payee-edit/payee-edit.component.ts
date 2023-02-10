import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ObjectId } from 'bson';
import { Subscription } from 'rxjs';
import { CardService } from 'src/app/card/card.service';
import { IPayee } from '../payee';
import { PayeeService } from '../payee.service';

@Component({
  selector: 'app-payee-edit',
  templateUrl: './payee-edit.component.html',
  styleUrls: ['./payee-edit.component.css']
})
export class PayeeEditComponent implements OnInit {
  subArray: Subscription[] = []

  constructor(private route: ActivatedRoute,
    private router: Router,
    private payeeService: PayeeService) { }

  pageTitle = 'Edit Payee';
  currentPayee!: IPayee;
  originalPayee!: IPayee;
  loading = false;

  ngOnInit(): void {
    this.initialise();
  }

  initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      let _id: string = param['_id'];
      if (_id == 'new') this.pageTitle = 'Add Payee';
      this.currentPayee = this.payeeService.getPayee(_id);
      this.originalPayee = { ...this.currentPayee };
    })
    this.subArray.push(sub1);
  }

  async savePayee() {
    this.loading = true;
    if (this.currentPayee._id == 'new') {
      this.currentPayee._id = new ObjectId().toString();
      await this.payeeService.addPayee(this.currentPayee);
    } else {
      await this.payeeService.editPayee(this.currentPayee);
    }
    this.router.navigate(['/payee'])
  }

  reset() {
    this.initialise();
  }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }
}