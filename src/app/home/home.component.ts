
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CardService } from '../card/card.service';
import { PayeeService } from '../payment/payee.service';
import { IProductStats } from '../product/product';
import { ProductServiceService } from '../product/product-service.service';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styles: []
})
export class HomeComponent implements OnInit, OnDestroy {

    constructor(private productService: ProductServiceService,
        private cardservice: CardService,
        private payeeService: PayeeService) { }

    productStat!: IProductStats;
    pendingAmount!: any;
    pendingCardAmount!: number;
    subArray: Subscription[] = [];
    cols!: any

    ngOnInit() {
        let sub1: Subscription = this.productService.getStats().subscribe((stat: IProductStats) => {
            this.productStat = stat;
        })
        this.subArray.push(sub1);
        let sub2: Subscription = this.payeeService.getPendingAmount().subscribe((data) => {
            this.pendingAmount = data;
        })
        this.subArray.push(sub2);
        let sub3 = this.cardservice.getPendingAmount().subscribe((data)=> this.pendingCardAmount = data);
        this.subArray.push(sub3);
    }

    ngOnDestroy(): void {
        this.subArray.forEach((sub) => sub.unsubscribe());
    }

}
