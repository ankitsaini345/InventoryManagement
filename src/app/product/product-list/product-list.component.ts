import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subscription } from 'rxjs';
import { CardService } from 'src/app/card/card.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';
import { toCanvas } from 'html-to-image';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Icard } from 'src/app/card/card';
import { ShareService } from 'src/app/share.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  constructor(private productService: ProductServiceService,
    private cardService: CardService,
    private clipboard: Clipboard,
    private shareService: ShareService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.orgProduct = null;
  }

  private productStorageString = 'inventoryProducts';
  products: IProduct[] = [];
  filterBy = '';
  aggregate: any = {};
  orgProduct: IProduct | null;
  subArray: Subscription[] = [];
  filteredValue: IProduct[] = [];
  invoiceDataArray: any[] = []
  invoiceTableDisplay = false;
  shareButtonLoading = false;

  @ViewChild('dt') table!: Table;

  deliveryDialog = {
    display: false,
    date: '',
    type: ''
  }


  appName = ["Amazon", "Flipkart", "Samsung", "Realme", "Vivo", "Oppo", "Mi", "1+", "TataCliQ", "Reliance", "Others"];
  orderStatus = ['Ordered', 'Shipped', 'DeliveredToLoc', 'DeliveredHome', 'Distributor', 'Cancelled']
  cardNames: string[] = [];
  selectedProduct: IProduct[] = [];

  ngOnInit(): void {
    this.getProducts();
    this.getCardNames();
  }

  onFilter(event: any) {
    this.filteredValue = event.filteredValue;
    this.calcTotal();
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
        this.filteredValue = products;
        this.calcTotal();
      });
      this.subArray.push(sub);
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Error in getting Products: ' + error.message });
    }
  }

  globalFilter(event: any) {
    // console.log(event.target.);
    // console.log(this.table);
    // console.log('filterby ' + this.filterBy);

    this.table.filterGlobal(event.target.value, 'contains');
    // console.log('values ', this.table.value);
    // console.log('Fvalues ', this.table.);


  }

  calcTotal() {
    this.aggregate = {};
    this.filteredValue.forEach((item) => {
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

  deleteProduct(event: Event, product: IProduct) {

    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you delete product: ' + product.name,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(product);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Product deletion Cancelled.',
        });
      },
    });

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
      console.error(error);
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Error in updaing ' + product.name + ' ' + error.message });
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

  onDateSelect(value: any) {
    console.log(value);
    console.log(this.formatDate(value));

    console.log(this.table);


    this.table.filter(this.formatDate(value), 'date', 'equals')
  }

  formatDate(date: any) {
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }

    return date.getFullYear() + '-' + month + '-' + day;
  }

  async exportText() {
    // console.log(this.selectedProduct);
    if (!this.selectedProduct.length) {
      console.error('No Product Selected');
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'No Product Selected' });
    } else {
      let exportData: any = {};
      let totalAmount = 0;
      let totalQty = 0;
      let checkQty = 0;
      this.selectedProduct.forEach((item) => {
        let name = item.name + ' ' + item.ram + ' ' + item.storage;
        item.buyerPrice = Math.round(item.buyerPrice);

        if (exportData.hasOwnProperty(name)) {
          if (exportData[name].cost == item.buyerPrice) {
            // name present cost match
            exportData[name].qty += 1;
            exportData[name].totalCost = exportData[name].qty * exportData[name].cost;
            checkQty++;
          } else {
            //name present & cost mismatch. add cost in bracket
            const modName = name + ('(' + item.buyerPrice + ')');
            if (exportData.hasOwnProperty(modName)) {
              exportData[modName].qty += 1;
              exportData[modName].totalCost = exportData[modName].qty * exportData[modName].cost;
              checkQty++;
            } else {
              exportData[modName] = {
                qty: 1,
                cost: item.buyerPrice,
                totalCost: item.buyerPrice
              }
              checkQty++;
            }
          }
        } else {
          exportData[name] = {
            qty: 1,
            cost: item.buyerPrice,
            totalCost: item.buyerPrice
          }
          checkQty++;
        }
        totalAmount += item.buyerPrice;
        totalQty += 1;
      })
      if (checkQty != totalQty) {
        console.log('quantity mismatch');
        console.log('total: ' + totalQty + ' check: ' + checkQty);
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Quantity Mismatch' });
      }

      this.invoiceDataArray = [];

      for (const key in exportData) {
        const obj = {
          name: key,
          cost: exportData[key].cost,
          qty: exportData[key].qty,
          total: exportData[key].totalCost
        }
        this.invoiceDataArray.push(obj)
      }
      this.invoiceDataArray.push({
        name: 'Total',
        qty: totalQty,
        total: totalAmount
      });
      this.invoiceTableDisplay = true;

      // let tableArray = [];
      // tableArray.push(['Name', '1PcCost', 'Qty', 'Amount'])
      // for (const key in exportData) {
      //   tableArray.push([key, exportData[key].cost, exportData[key].qty, exportData[key].totalCost])
      // }
      // tableArray.push(['Total', '', totalQty, totalAmount])

      // let cdata = table(tableArray);

      this.clipboard.copy('Items: ' + totalQty + ' Amount: ' + totalAmount);
      // const shareMessage: any = await this.shareService.share({
      //   title: 'Invoice',
      //   text: cdata
      // })
      // if (shareMessage.error) {
      //   this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: shareMessage.message });
      // }
    }
  }

  async shareData() {
    this.shareButtonLoading = true;
    // Get canvas as dataURL
    // console.log('share fn');

    let node = document.getElementById('invoiceData');
    let dataUrl = (await toCanvas(node!)).toDataURL();
    // console.log(dataUrl);

    // Convert dataUrl into blob using browser fetch API
    const blob = await (await fetch(dataUrl)).blob()

    // Create file form the blob
    const image = new File([blob], 'invoice.png', { type: blob.type })
    let len = this.invoiceDataArray.length;
    // Check if the device is able to share these files then open share dialog
    if (navigator.canShare && navigator.canShare({ files: [image] })) {
      try {
        await navigator.share({
          text: 'Items: ' + this.invoiceDataArray[len - 1].qty + ' Amount: ' + this.invoiceDataArray[len - 1].total,
          files: [image],         // Array of files to share
          title: 'Invoice'  // Share dialog title
        })
      } catch (error) {
        console.log('Sharing failed!', error)
        this.invoiceTableDisplay = false;
        this.invoiceDataArray = [];
        this.shareButtonLoading = false
      }
    } else {
      console.log('This device does not support sharing files.')
    }
    this.invoiceTableDisplay = false;
    this.invoiceDataArray = [];
    this.shareButtonLoading = false;
    if (this.selectedProduct.length) {
      this.selectedProduct = [];
    }
  }

  async exportTelegramData() {
    if (!this.selectedProduct.length) {
      console.error('No Product Selected');
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'No Product Selected' });
    } else {
      let lastDate = this.selectedProduct[0].date;
      let exportString = '';
      exportString += lastDate + '\n';
      this.selectedProduct.forEach((item) => {
        if (item.date != lastDate) {
          lastDate = item.date;
          exportString += lastDate + '\n';
        }
        exportString += (item.name + ' ' + item.ram + 'x' + item.storage + ' ' + item.AppName + '/' + item.AppAccount + ' ' + item.listPrice + ' ' + item.costToMe + ' ');
        if (item.coupon) exportString += (item.coupon + ' ');
        if (item.cardDiscount) exportString += (item.cardDiscount + ' ');
        if (item.delivery) exportString += (item.delivery + ' ');
        if (item.giftBalence) exportString += (item.giftBalence + ' ');
        exportString += (item.cardHolder + '=' + item.cardAmount + ' ');
        if (item.cashback) exportString += (item.cashback + ' ');
        if (item.profit) exportString += (item.profit + ' ');
        if (item.buyerPrice) exportString += (item.buyerPrice + ' ');
        exportString += '\n\n';
      });

      this.clipboard.copy(exportString);

      if (this.selectedProduct.length) {
        this.selectedProduct = [];
      }

      const shareData: ShareData = {
        title: 'Order Details',
        text: exportString
      }
      const shareMessage = await this.shareService.share(shareData);
      if (shareMessage.error) {
        console.error(shareMessage.message);
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: shareMessage.message });
      }
    }
  }

  deliveryStatus(flag: boolean) {
    if (flag) {
      if (!this.selectedProduct.length) {
        console.error('No Product Selected');
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'No Product Selected' });
      } else {
        this.bulkStatusChange(this.deliveryDialog.type, this.deliveryDialog.date);
      }
    }
    this.deliveryDialog.display = false,
      this.deliveryDialog.date = '',
      this.deliveryDialog.type = ''
    if (this.selectedProduct.length) {
      this.selectedProduct = [];
    }
  }

  async bulkStatusChange(status: string, date: string) {
    let promiseArray: Promise<any>[] = [];
    this.selectedProduct.forEach((product: IProduct) => {
      let originalProduct = product;
      // if (product.status != status) {
      product.status = status;
      if (status == 'Distributor') product.buyerDate = this.formatDate(date);
      if (status == 'DeliveredHome') product.deliveryDate = this.formatDate(date);
      let pro = this.productService.editProduct(product, originalProduct, false);
      promiseArray.push(pro);
      // }
      if (this.selectedProduct.length) {
        this.selectedProduct = [];
      }
    });
    Promise.all(promiseArray).then(() => {
      localStorage.removeItem(this.productStorageString);
      this.productService.initialiseProductData();
    })
    this.filterBy = ''
  }


  ngOnDestroy(): void {
    this.subArray.forEach((sub: Subscription) => {
      sub.unsubscribe();
    })
  }

  onRepresentativeChange(event: any) {
    this.table.filter(event.value, 'status', 'in')
  }

  invoiceTableClose(): any {
    this.invoiceDataArray = [];
    this.invoiceTableDisplay = false;
    if (this.selectedProduct.length) {
      this.selectedProduct = [];
    }

  }
}
