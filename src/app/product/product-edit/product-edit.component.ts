import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ObjectId } from 'bson'


import { Icard } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
import { CommonService } from 'src/app/common.service';
import { Itxn } from 'src/app/txn/transaction';
import { TxnService } from 'src/app/txn/txn.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private txnService: TxnService,
    private common: CommonService,
    private toastService: ToastrService,
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct!: IProduct;
  originalProduct!: IProduct;
  cards!: Icard[];
  productNamesArray: any = [];

  set listPrice(val: number) {
    this.currentProduct.listPrice = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.cashbackAmount(this.currentProduct.cashback) + this.currentProduct.delivery;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set coupon(val: number) {
    this.currentProduct.coupon = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.cashbackAmount(this.currentProduct.cashback) + this.currentProduct.delivery;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set cardDiscount(val: number) {
    this.currentProduct.cardDiscount = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.cashbackAmount(this.currentProduct.cashback) + this.currentProduct.delivery;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }
  set delivery(val: number) {
    this.currentProduct.delivery = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.cashbackAmount(this.currentProduct.cashback) + this.currentProduct.delivery;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set giftBalence(val: number) {
    this.currentProduct.giftBalence = val;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.cashbackAmount(this.currentProduct.cashback);;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }
  
  set dPrice(val: number) {
    this.currentProduct.buyerPrice = val;
    this.currentProduct.profit = this.currentProduct.buyerPrice - this.currentProduct.costToMe;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set cashback(val: number) {
    this.currentProduct.cashback = val;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.cashbackAmount(this.currentProduct.cashback);;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  ngOnInit(): void {
    this.initialiseData();
  }

  async initialiseData() {
    try {
      let _id = this.route.snapshot.params['id'];
      if (_id == 'new') this.pageTitle = 'Add Product';
      this.currentProduct = await firstValueFrom(this.productService.getProduct(_id))
      this.originalProduct = { ...this.currentProduct };
      this.productNamesArray = await firstValueFrom(this.productService.getUniqueProducts('name'));
      this.cards = await firstValueFrom(this.cardService.getCards());
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  async saveProduct() {
    try {
      if (this.currentProduct._id == 'new') {
        this.currentProduct._id = new ObjectId().toString();
        this.currentProduct.txnId = new ObjectId().toString();
        await firstValueFrom(this.productService.addProduct(this.currentProduct));
        await this.addTxn(this.currentProduct);
        let cardInfo = await firstValueFrom(this.cardService.getCard(this.currentProduct.cardHolder));
        cardInfo.amountDue += this.currentProduct.cardAmount;
        cardInfo.totalAmount += this.currentProduct.cardAmount;
        await firstValueFrom(this.cardService.updateCard(cardInfo));
        this.toastService.success('Product ' + this.currentProduct.name + ' added.')
      } else {
        if (this.currentProduct != this.originalProduct) {
          await firstValueFrom(this.productService.editProduct(this.currentProduct));
          if (this.currentProduct.cardAmount != this.originalProduct.cardAmount)
            await this.updateTxn(this.currentProduct);
            let cardInfo = await firstValueFrom(this.cardService.getCard(this.currentProduct.cardHolder));
            cardInfo.amountDue -= this.originalProduct.cardAmount;
            cardInfo.amountDue += this.currentProduct.cardAmount;
            cardInfo.totalAmount -= this.originalProduct.cardAmount;
            cardInfo.totalAmount += this.currentProduct.cardAmount;
            await firstValueFrom(this.cardService.updateCard(cardInfo));
        }
        this.toastService.success('Product ' + this.currentProduct.name + ' updated.')
      }
      this.router.navigate(['/products']);
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  resetProduct() {
    try {
      this.productService.getProduct('new').subscribe((product) => {
        this.currentProduct = product;
        this.originalProduct = product;
      });
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  async addTxn(product: IProduct) {
    try {
      const txn: Itxn = {
        _id: product.txnId,
        amount: product.cardAmount,
        orderId: product._id,
        txnDate: product.date,
        cardName: product.cardHolder,
        OrderName: product.name
      }
      await firstValueFrom(this.txnService.addTxn(txn));
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  async updateTxn(product: IProduct) {
    try {
      const txn: Itxn = {
        _id: product.txnId,
        amount: product.cardAmount,
        orderId: product._id,
        txnDate: product.date,
        cardName: product.cardHolder,
        OrderName: product.name
      }
      await firstValueFrom(this.txnService.updateTxn(txn));
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  cashbackAmount(per: number): number {
    if (!per) return 0;
    else return (this.currentProduct.cardAmount * (per / 100));
  }
}

