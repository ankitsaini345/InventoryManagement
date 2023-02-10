import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { IPayment } from '../payment';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit, OnDestroy {
  constructor(private paymentService: PaymentService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.orgPayment = null;
  }

  private PaymentStorageString = 'inventoryPayments';

  payments: IPayment[] = [];
  filterBy = '';
  payeeName!: string;
  aggregate: any = {};
  orgPayment: IPayment | null;
  subArray: Subscription[] = [];
  @ViewChild('dt') table!: Table;

  deliveryDialog = {
    display: false,
    date: '',
    type: ''
  }


  mode = ["phonePe", "Gpay", "Paytm", "Cash", "Card", "Others"];

  // cardNames: string[] = [];
  selectedPayment: IPayment[] = [];

  ngOnInit(): void {
    this.initialise();
  }

  async getPayments() {
    try {
      let sub: Subscription = this.paymentService.getPayments().subscribe((payments) => {
        this.payments = payments;
        // this.calcTotal();
      });
      this.subArray.push(sub);
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in getting Products: ' + error.message });
    }
  }

  async initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      this.payeeName = param['name'];
      if (this.payeeName == 'All') {
        let sub2: Subscription = this.paymentService.getPayments().subscribe((payments)=> {
          this.payments = payments;
        });
        this.subArray.push(sub2);
      } else {
        this.payments = await this.paymentService.getPaymentByName(this.payeeName);
      }
    })
    this.subArray.push(sub1);
    // this.calcTotal();
  }

  // calcTotal() {
  //   this.aggregate = {};
  //   this.payments.forEach((item) => {
  //     this.aggregate.listPrice ? this.aggregate.listPrice += item.listPrice : this.aggregate.listPrice = item.listPrice;
  //     this.aggregate.cardAmount ? this.aggregate.cardAmount += item.cardAmount : this.aggregate.cardAmount = item.cardAmount;
  //     this.aggregate.buyerPrice ? this.aggregate.buyerPrice += item.buyerPrice : this.aggregate.buyerPrice = item.buyerPrice;
  //     this.aggregate.coupon ? this.aggregate.coupon += item.coupon : this.aggregate.coupon = item.coupon;
  //     this.aggregate.giftBalence ? this.aggregate.giftBalence += item.giftBalence : this.aggregate.giftBalence = item.giftBalence;
  //     this.aggregate.cardDiscount ? this.aggregate.cardDiscount += item.cardDiscount : this.aggregate.cardDiscount = item.cardDiscount;
  //     this.aggregate.profit ? this.aggregate.profit += item.profit : this.aggregate.profit = item.profit;
  //     this.aggregate.cashback ? this.aggregate.cashback += item.cashback : this.aggregate.cashback = item.cashback;
  //     this.aggregate.delivery ? this.aggregate.delivery += item.delivery : this.aggregate.delivery = item.delivery;
  //     this.aggregate.costToMe ? this.aggregate.costToMe += item.costToMe : this.aggregate.costToMe = item.costToMe;
  //   })
  //   this.aggregate.buyerPrice = Math.round(this.aggregate.buyerPrice);
  //   this.aggregate.costToMe = Math.round(this.aggregate.costToMe);
  // }

  deletePayment(event: Event, payment: IPayment) {

    this.confirmationService.confirm({
      target: event.target!,
      message: 'Are you sure that you delete payment: ' + payment.name,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.paymentService.deletePayment(payment);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Rejected',
          detail: 'Payment deletion Cancelled.',
        });
      },
    });

  }

  onRowEditInit(payment: IPayment) {
    this.orgPayment = payment;
  }

  onRowEditSave(payment: IPayment) {
    try {
      if (this.orgPayment && payment._id == this.orgPayment._id && (this.orgPayment != payment)) {
        this.paymentService.updatePayment(payment)
      } else throw 'orgPayment missing or id is different'
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error in updaing ' + payment.name + ' ' + error.message });
    }
  }

  onRowEditCancel(payment: IPayment, index: number) {
    this.orgPayment = null;
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
    
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'function not defined' });
    
    // // console.log(this.selectedProduct);
    // if (!this.selectedPayment.length) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Payment Selected' });
    // } else {
    //   let exportData: any = {};
    //   let totalAmount = 0;
    //   let totalQty = 0;
    //   this.selectedPayment.forEach((item) => {
    //     let name = item.name + ' ' + item.ram + ' ' + item.storage;
    //     item.buyerPrice = Math.round(item.buyerPrice);
    //     if (exportData.hasOwnProperty(name) && exportData[name].cost == item.buyerPrice) {
    //       exportData[name].qty += 1;
    //       exportData[name].totalCost = exportData[name].qty * exportData[name].cost;
    //     } else {
    //       exportData[name] = {
    //         qty: 1,
    //         cost: item.buyerPrice,
    //         totalCost: item.buyerPrice
    //       }
    //     }
    //     totalAmount += item.buyerPrice;
    //     totalQty += 1;
    //   })
    //   let tableArray = [];
    //   tableArray.push(['Name', '1PcCost', 'Qty', 'Amount'])
    //   for (const key in exportData) {
    //     tableArray.push([key, exportData[key].cost, exportData[key].qty, exportData[key].totalCost])
    //   }
    //   tableArray.push(['Total', '', totalQty, totalAmount])

    //   let cdata = table(tableArray);

    //   this.clipboard.copy(cdata);
    //   // const shareMessage: any = await this.shareService.share({
    //   //   title: 'Invoice',
    //   //   text: cdata
    //   // })
    //   // if (shareMessage.error) {
    //   //   this.messageService.add({ severity: 'error', summary: 'Error', detail: shareMessage.message });
    //   // }
    // }
  }

  async exportTelegramData() {

    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'function not defined' });


    // if (!this.selectedPayment.length) {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Payment Selected' });
    // } else {
    //   let exportString = '';
    //   this.selectedPayment.forEach((item) => {

    //     exportString += (item.name + ' ' + item.ram + 'x' + item.storage + ' ' + item.AppName + '/' + item.AppAccount + ' ' + item.listPrice + ' ' + item.costToMe + ' ');
    //     if (item.coupon) exportString += (item.coupon + ' ');
    //     if (item.cardDiscount) exportString += (item.cardDiscount + ' ');
    //     if (item.delivery) exportString += (item.delivery + ' ');
    //     if (item.giftBalence) exportString += (item.giftBalence + ' ');
    //     exportString += (item.cardHolder + '=' + item.cardAmount + ' ');
    //     if (item.cashback) exportString += (item.cashback + ' ');
    //     if (item.profit) exportString += (item.profit + ' ');
    //     if (item.buyerPrice) exportString += (item.buyerPrice + ' ');
    //     exportString += '\n';
    //   });

    //   this.clipboard.copy(exportString);

    //   const shareData: ShareData = {
    //     title: 'Order Details',
    //     text: exportString
    //   }
    //   const shareMessage = await this.shareService.share(shareData);
    //   if (shareMessage.error) {
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: shareMessage.message });
    //   }
    // }
  }

  deliveryStatus(flag: boolean) {
    if (!this.selectedPayment.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Payment Selected' });
    } else {
      if (flag) {
        this.bulkStatusChange(this.deliveryDialog.type, this.deliveryDialog.date);
        this.deliveryDialog.display = false;
      } else {
        this.deliveryDialog.display = false,
          this.deliveryDialog.date = '',
          this.deliveryDialog.type = ''
      }
    }
  }

  async bulkStatusChange(status: string, date: string) {

    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'function not defined' });


    // let promiseArray: Promise<any>[] = [];
    // this.selectedPayment.forEach((payment: IPayment) => {
    //   let originalProduct = payment;
    //   if (payment.status != status) {
    //     payment.status = status;
    //     if (status == 'Distributor') payment.buyerDate = date;
    //     if (status == 'DeliveredHome') payment.deliveryDate = date;
    //     let pro = this.productService.editProduct(payment, originalProduct, false);
    //     promiseArray.push(pro);
    //   }
    // });
    // Promise.all(promiseArray).then(() => {
    //   sessionStorage.removeItem(this.PaymentStorageString);
    //   this.productService.initialiseProductData();
    // })
    // this.filterBy = ''
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

  onRepresentativeChange(event: any) {
    this.table.filter(event.value, 'status', 'in')
  }

}
