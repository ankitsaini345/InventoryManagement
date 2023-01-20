import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ObjectId } from 'bson'


import { Icard } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
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
    private toastService: ToastrService,
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct!: IProduct;
  originalProduct!: IProduct;
  cards!: Icard[];
  productNamesArray: any = [];
  isLoading = false;
  addMoreProduct = true
  set listPrice(val: number) {
    this.currentProduct.listPrice = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set coupon(val: number) {
    this.currentProduct.coupon = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set cardDiscount(val: number) {
    this.currentProduct.cardDiscount = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback + this.currentProduct.delivery;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }
  set delivery(val: number) {
    this.currentProduct.delivery = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set giftBalence(val: number) {
    this.currentProduct.giftBalence = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set dPrice(val: number) {
    this.currentProduct.buyerPrice = val;
    this.currentProduct.profit = this.currentProduct.buyerPrice - this.currentProduct.costToMe;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  set profit(val: number) {
    this.currentProduct.profit = val;
    this.currentProduct.buyerPrice = this.currentProduct.profit + this.currentProduct.costToMe;
  }

  set cashback(val: number) {
    this.currentProduct.cashback = this.cashbackAmount(val);
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get dPrice() {
    return this.currentProduct.buyerPrice;
  }

  get profit() {
    return this.currentProduct.profit;
  }


  ngOnInit(): void {
    this.initialiseData();
  }

  async initialiseData() {
    try {
      let _id = this.route.snapshot.params['id'];
      if (_id == 'new') this.pageTitle = 'Add Product';
      this.currentProduct = await this.productService.getProduct(_id);
      this.originalProduct = { ...this.currentProduct };
      this.cards = await this.cardService.getCards();
      this.productNamesArray = await firstValueFrom(this.productService.getUniqueProducts('name'));
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  async saveProduct() {
    try {
      if (this.currentProduct._id == 'new') {
        this.currentProduct._id = new ObjectId().toString();
        this.currentProduct.txnId = new ObjectId().toString();
        this.productService.addProduct(this.currentProduct);
      } else {
        if (this.currentProduct != this.originalProduct) {
          this.productService.editProduct(this.currentProduct, this.originalProduct);
          this.toastService.success('Product ' + this.currentProduct.name + ' updated.')
        }
        else this.toastService.success('No Change in Product to save')
      }
      if (this.addMoreProduct) {
        this.currentProduct = await this.productService.getProduct('new');
        this.originalProduct = { ...this.currentProduct };
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      } else this.router.navigate(['/products']);
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  async resetProduct() {
    try {
      this.currentProduct = await this.productService.getProduct('new');
      this.originalProduct = { ...this.currentProduct };
    } catch (error: any) {
      this.toastService.error(error.message)
    }
  }

  cashbackAmount(per: number): number {
    if (!per) return 0;
    else return Math.round((this.currentProduct.cardAmount * (per / 100)));
  }
}

