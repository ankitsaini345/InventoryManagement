import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { table } from 'table';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CardService } from 'src/app/card/card.service';
import { TxnService } from 'src/app/txn/txn.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ShareService } from 'src/app/share.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  providers: [MessageService],
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  constructor(private productService: ProductServiceService,
    private cardService: CardService,
    private txnService: TxnService,
    private clipboard: Clipboard,
    private shareService: ShareService,
    private messageService: MessageService,
    private toastService: ToastrService) {
    this.orgProduct = null;
  }

  products: IProduct[] = [];
  filterBy = '';
  aggregate: any = {};
  orgProduct: IProduct | null;

  appName = ["Amazon", "Flipkart", "Samsung", "Realme", "Vivo", "Oppo", "Mi", "1+", "TataCliQ", "Reliance", "Others"];
  orderStatus = ['Ordered', 'Shipped', 'DeliveredToLoc', 'DeliveredHome', 'Distributor', 'Cancelled']
  cardHolder = ['test'];
  // clonedProducts: { [s: string]: IProduct; } = {};
  selectedProduct: IProduct[] = [];

  ngOnInit(): void {
    this.getProducts();
  }

  async getProducts() {
    // this.productService.getProducts().subscribe((data) => {
    //   this.products = data;
    //   console.log(data);
    // })

    try {
      this.products = await this.productService.getProducts();
      this.calcTotal();
    } catch (error: any) {
      this.toastService.error(error.message);
    }
  }

  calcTotal() {
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

  async deleteProduct(product: IProduct) {
    // this.productService.deleteProduct(_id).subscribe({
    //   next: () => {
    //     console.log('Product with id ' + _id + ' deleted');
    //     this.getProducts();
    //   },
    //   error: (err) => {
    //     console.error('Error while deleting product with id ' + _id);
    //     console.error(err);
    //   }
    // })

    try {
      await firstValueFrom(this.productService.deleteProduct(product._id));
      this.toastService.success('Product ' + product.name + ' deleted.');
      await this.getProducts();
      await firstValueFrom(this.txnService.deleteTxn(product.txnId));
      let cardInfo = await this.cardService.getCard(product.cardHolder);
      cardInfo.amountDue -= product.cardAmount;
      cardInfo.totalAmount -= product.cardAmount;
      await firstValueFrom(this.cardService.updateCard(cardInfo));
    } catch (error: any) {
      this.toastService.error(error.message);
    }
  }

  // cancelProduct(_id: any) {
  //   this.productService.deleteProduct(_id).subscribe({
  //     next: () => {
  //       console.log('Product with id ' + _id + ' deleted');
  //       this.getProducts();
  //     },
  //     error: (err) => {
  //       console.error('Error while deleting product with id ' + _id);
  //       console.error(err);
  //     }
  //   })
  // }


  onRowEditInit(product: IProduct) {
    this.orgProduct = product;
  }

  onRowEditSave(product: IProduct) {
    try {
      if (this.orgProduct && product._id == this.orgProduct._id) {
        this.productService.editProduct(product, this.orgProduct!)
        this.messageService.add({ severity: 'success', summary: 'Success', detail: product.name + ' is updated' });
      } else throw 'orgProduct missing or id is different'
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in updaing ' + product.name + ' ' + error.message });
    }

  }

  onRowEditCancel(product: IProduct, index: number) {
    this.orgProduct = null
  }

  onRowSelect(event: any) {
    console.log(event);

  }

  onRowUnselect(event: any) {
    console.log(event);

  }
  schange(event: any) {
    console.log(this.selectedProduct);
  }

  async exportText() {
    console.log(this.selectedProduct);

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
  // async exportImage() {
  //   const dataUrl = await toPng(document.getElementById('my-table')!)
  //   this.clipboard.copy(dataUrl);
  // }

}
