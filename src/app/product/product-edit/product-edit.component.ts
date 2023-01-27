import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { ObjectId } from 'bson'


import { Icard } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private messageService: MessageService,
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct!: IProduct;
  originalProduct!: IProduct;
  subArray: Subscription[] = [];
  cards!: Icard[];
  productNamesArray: any = [];
  isLoading = false;
  addMoreProduct = true;
  cashbackup!: number

  get listPrice() {
    return this.currentProduct.listPrice;
  }

  set listPrice(val: number) {
    this.currentProduct.listPrice = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get coupon() {
    return this.currentProduct.coupon;
  }

  set coupon(val: number) {
    this.currentProduct.coupon = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get cardDiscount() {
    return this.currentProduct.cardDiscount;
  }

  set cardDiscount(val: number) {
    this.currentProduct.cardDiscount = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback + this.currentProduct.delivery;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get delivery() {
    return this.currentProduct.delivery;
  }

  set delivery(val: number) {
    this.currentProduct.delivery = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get giftBalence() {
    return this.currentProduct.giftBalence;
  }

  set giftBalence(val: number) {
    this.currentProduct.giftBalence = val;
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.cardAmount < 0) this.currentProduct.cardAmount = 0;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get dPrice() {
    return this.currentProduct.buyerPrice;
  }

  set dPrice(val: number) {
    this.currentProduct.buyerPrice = val;
    this.currentProduct.profit = this.currentProduct.buyerPrice - this.currentProduct.costToMe;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  get profit() {
    return this.currentProduct.profit;
  }

  set profit(val: number) {
    this.currentProduct.profit = val;
    this.currentProduct.buyerPrice = this.currentProduct.profit + this.currentProduct.costToMe;
  }

  // get cashback() {
  //   return this.currentProduct.cashback;
  // }

  set cashback(val: number) {
    this.currentProduct.cashback = this.cashbackAmount(val);
    this.currentProduct.cardAmount = this.currentProduct.listPrice! - this.currentProduct.coupon - this.currentProduct.cardDiscount + this.currentProduct.delivery - this.currentProduct.giftBalence;
    this.currentProduct.costToMe = this.currentProduct.cardAmount + this.currentProduct.giftBalence - this.currentProduct.cashback;
    if (this.currentProduct.costToMe < 0) this.currentProduct.costToMe = 0;
  }

  ngOnInit(): void {
    this.initialiseData();
  }

  async initialiseData() {
    try {
      let sub: Subscription = this.route.params.subscribe(async (param) => {
        let _id: string = param['id'];
        if (_id == 'new')
          this.pageTitle = 'Add Product';
        this.currentProduct = this.productService.getProduct(_id);
        this.originalProduct = { ...this.currentProduct };
        this.cashbackup = this.currentProduct.cashback;
      });
      this.subArray.push(sub);

      let sub1 = this.cardService.getCards().subscribe((cards) => {
        this.cards = cards;
      });
      this.subArray.push(sub1);
      this.productNamesArray = await firstValueFrom(this.productService.getUniqueProducts('name'));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in initialising Products: ' + error.message });
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
        }
        else this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Change in Product to save' });
      }
      if (this.addMoreProduct) {
        this.resetProduct();
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      } else this.router.navigate(['/products']);
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to save product. Error: ' + error.message });
    }
  }

  resetProduct() {
    this.currentProduct = this.productService.getProduct('new');
    this.originalProduct = { ...this.currentProduct };
  }

  cashbackAmount(per: number): number {
    if (!per) return this.cashbackup;
    else return Math.round((this.currentProduct.cardAmount * (per / 100)));
  }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }

}

