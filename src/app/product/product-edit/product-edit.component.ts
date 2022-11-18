import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Icard, IcardTxn } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct!: IProduct;
  originalProduct!: IProduct;
  cards!: Icard[];

  set listPrice(val: number) {
    this.currentProduct.listPrice = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice - this.currentProduct.coupon;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;    
  }

  set coupon(val: number) {
    this.currentProduct.coupon = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
  }

  set cardDiscount(val: number) {
    this.currentProduct.cardDiscount = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
  }

  set giftBalence(val: number) {
    this.currentProduct.giftBalence = val;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence;
  }

  set dPrice(val: number) {
    this.currentProduct.buyerPrice = val;
    this.currentProduct.profit = this.currentProduct.buyerPrice - this.currentProduct.costToMe;
  }

  ngOnInit(): void {

    this.initialiseData();
  }

  async initialiseData() {
    let id = +this.route.snapshot.params['id'];
    if (id == 0) this.pageTitle = 'Add Product';
    this.currentProduct = await firstValueFrom(this.productService.getProduct(id))
    this.originalProduct = this.currentProduct;

    this.cards = await firstValueFrom(this.cardService.getCards());
  }

  async saveProduct() {
    if (this.currentProduct.id == 0) {
      this.currentProduct = await firstValueFrom(this.productService.addProduct(this.currentProduct));
      const txn: IcardTxn = {
        id: null,
        amount: this.currentProduct.cardAmount,
        orderId: this.currentProduct.id,
        txnDate: this.currentProduct.date,
        OrderName: this.currentProduct.name
      }
      await this.cardService.addCardTxn(this.currentProduct.cardHolder, txn);
    } else {
      this.currentProduct = await firstValueFrom(this.productService.editProduct(this.currentProduct));
    }
    this.router.navigate(['/products'])
  }

  resetProduct() {
    this.productService.getProduct(0).subscribe((product) => {
      this.currentProduct = product;
      this.originalProduct = product;
    });
  }

}
