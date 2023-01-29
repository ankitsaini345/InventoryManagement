import { Component, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { table } from 'table';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import { Subscription } from 'rxjs';
import { CardService } from 'src/app/card/card.service';
import { TxnService } from 'src/app/txn/txn.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

import { MessageService } from 'primeng/api';
import { Icard } from 'src/app/card/card';
import { ShareService } from 'src/app/share.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  constructor(private productService: ProductServiceService,
    private cardService: CardService,
    private clipboard: Clipboard,
    private shareService: ShareService,
    private messageService: MessageService
  ) {
    this.orgProduct = null;
  }

  products: IProduct[] = [];
  filterBy = '';
  aggregate: any = {};
  orgProduct: IProduct | null;
  subArray: Subscription[] = [];

  appName = ["Amazon", "Flipkart", "Samsung", "Realme", "Vivo", "Oppo", "Mi", "1+", "TataCliQ", "Reliance", "Others"];
  orderStatus = ['Ordered', 'Shipped', 'DeliveredToLoc', 'DeliveredHome', 'Distributor', 'Cancelled']
  cardNames: string[] = [];
  selectedProduct: IProduct[] = [];

  ngOnInit(): void {
    this.getProducts();
    this.getCardNames();
  }

  async getCardNames() {
    let sub: Subscription = this.cardService.getCards().subscribe((cards: Icard[]) => {
      cards.forEach((card: Icard) => {
        this.cardNames.push(card.cardName);
      })
    });
    this.subArray.push(sub);
  }

  async getProducts() {
    try {
      let sub: Subscription = this.productService.getProducts().subscribe((products) => {
        this.products = products;
        this.calcTotal();
      });
      this.subArray.push(sub);
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in getting Products: ' + error.message });
    }
  }

  calcTotal() {
    this.aggregate = {};
    this.products.forEach((item) => {
      this.aggregate.listPrice ? this.aggregate.listPrice += item.listPrice : this.aggregate.listPrice = item.listPrice;
      this.aggregate.cardAmount ? this.aggregate.cardAmount += item.cardAmount : this.aggregate.cardAmount = item.cardAmount;
      this.aggregate.buyerPrice ? this.aggregate.buyerPrice += item.buyerPrice : this.aggregate.buyerPrice = item.buyerPrice;
      this.aggregate.coupon ? this.aggregate.coupon += item.coupon : this.aggregate.coupon = item.coupon;
      this.aggregate.giftBalence ? this.aggregate.giftBalence += item.giftBalence : this.aggregate.giftBalence = item.giftBalence;
      this.aggregate.cardDiscount ? this.aggregate.cardDiscount += item.cardDiscount : this.aggregate.cardDiscount = item.cardDiscount;
      this.aggregate.profit ? this.aggregate.profit += item.profit : this.aggregate.profit = item.profit;
      this.aggregate.cashback ? this.aggregate.cashback += item.cashback : this.aggregate.cashback = item.cashback;
      this.aggregate.delivery ? this.aggregate.delivery += item.delivery : this.aggregate.delivery = item.delivery;
      this.aggregate.costToMe ? this.aggregate.costToMe += item.costToMe : this.aggregate.costToMe = item.costToMe;
    })
    this.aggregate.buyerPrice = Math.round(this.aggregate.buyerPrice);
    this.aggregate.costToMe = Math.round(this.aggregate.costToMe);
  }

  deleteProduct(product: IProduct) {
    this.productService.deleteProduct(product);
  }

  onRowEditInit(product: IProduct) {
    this.orgProduct = product;
  }

  onRowEditSave(product: IProduct) {
    try {
      if (this.orgProduct && product._id == this.orgProduct._id) {
        this.productService.editProduct(product, this.orgProduct!)
      } else throw 'orgProduct missing or id is different'
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in updaing ' + product.name + ' ' + error.message });
    }
  }

  onRowEditCancel(product: IProduct, index: number) {
    this.orgProduct = null;
  }

  onRowSelect(event: any) {
    // console.log(event);
  }

  onRowUnselect(event: any) {
    // console.log(event);
  }
  schange(event: any) {
    // console.log(this.selectedProduct);
  }

  async exportText() {
    // console.log(this.selectedProduct);
    if (!this.selectedProduct.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Product Selected' });
    } else {
      let exportData: any = {};
      let totalAmount = 0;
      let totalQty = 0;
      this.selectedProduct.forEach((item) => {
        let name = item.name + ' ' + item.ram + ' ' + item.storage;
        item.buyerPrice = Math.round(item.buyerPrice);
        if (exportData.hasOwnProperty(name) && exportData[name].cost == item.buyerPrice) {
          exportData[name].qty += 1;
          exportData[name].totalCost = exportData[name].qty * exportData[name].cost;
        } else {
          exportData[name] = {
            qty: 1,
            cost: item.buyerPrice,
            totalCost: item.buyerPrice
          }
        }
        totalAmount += item.buyerPrice;
        totalQty += 1;
      })
      let tableArray = [];
      tableArray.push(['Name', '1PcCost', 'Qty', 'Amount'])
      for (const key in exportData) {
        tableArray.push([key, exportData[key].cost, exportData[key].qty, exportData[key].totalCost])
      }
      tableArray.push(['Total', '', totalQty, totalAmount])

      let cdata = table(tableArray);

      this.clipboard.copy(cdata);
      // const shareMessage: any = await this.shareService.share({
      //   title: 'Invoice',
      //   text: cdata
      // })
      // if (shareMessage.error) {
      //   this.messageService.add({ severity: 'error', summary: 'Error', detail: shareMessage.message });
      // }
    }
  }

  async exportTelegramData() {
    if (!this.selectedProduct.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Product Selected' });
    } else {
      let exportString = '';
      this.selectedProduct.forEach((item) => {

        exportString += (item.name + ' ' + item.ram + 'x' + item.storage + ' ' + item.AppName + '/' + item.AppAccount + ' ' + item.listPrice + ' ' + item.costToMe + ' ');
        if (item.coupon) exportString += (item.coupon + ' ');
        if (item.cardDiscount) exportString += (item.cardDiscount + ' ');
        if (item.delivery) exportString += (item.delivery + ' ');
        if (item.giftBalence) exportString += (item.giftBalence + ' ');
        exportString += (item.cardHolder + '=' + item.cardAmount + ' ');
        if (item.cashback) exportString += (item.cashback + ' ');
        if (item.profit) exportString += (item.profit + ' ');
        if (item.buyerPrice) exportString += (item.buyerPrice + ' ');
        exportString += '\n';
      });

      this.clipboard.copy(exportString);

      const shareData: ShareData = {
        title: 'Order Details',
        text: exportString
      }
      const shareMessage = await this.shareService.share(shareData);
      if (shareMessage.error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: shareMessage.message });
      }
    }
  }

  // async exportImage() {
  //   const dataUrl = await toPng(document.getElementById('my-table')!)
  //   this.clipboard.copy(dataUrl);
  // }

  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }

}
