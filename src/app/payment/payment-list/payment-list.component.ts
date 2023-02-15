import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ShareService } from 'src/app/share.service';
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
    private clipboard: Clipboard,
    private shareService: ShareService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
  }

  private PaymentStorageString = 'inventoryPayments';

  payments: IPayment[] = [];
  filterBy = '';
  payeeName!: string;
  aggregate: any = {};
  orgPayment: IPayment | null = null;
  subArray: Subscription[] = [];
  @ViewChild('dt') table!: Table;

  deliveryDialog = {
    display: false,
    date: '',
    type: ''
  }


  mode = ["phonePe", "Gpay", "Paytm", "Cash", "Card", "LIC", "Others"];

  // cardNames: string[] = [];
  selectedPayment: IPayment[] = [];

  ngOnInit(): void {
    this.initialise();
  }

  async getPayments() {
    try {
      let sub: Subscription = this.paymentService.getPayments().subscribe((payments) => {
        this.payments = payments;
      });
      this.subArray.push(sub);
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Error in getting Products: ' + error.message });
    }
  }

  async initialise() {
    let sub1: Subscription = this.route.params.subscribe(async (param) => {
      this.payeeName = param['name'];
      if (this.payeeName == 'All') {
        let sub2: Subscription = this.paymentService.getPayments().subscribe((payments) => {
          this.payments = payments;
        });
        this.subArray.push(sub2);
      } else {
        this.payments = this.paymentService.getPaymentByName(this.payeeName);
      }
    })
    this.subArray.push(sub1);
  }


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
      console.error(error);
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'Error in updaing ' + payment.name + ' ' + error.message });
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


  async exportData() {

    // this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'function not defined' });
    if (!this.selectedPayment.length) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No Payment Selected' });
    } else {
      let error = false;
      let exportString = '';
      this.selectedPayment.sort((a, b) => a.count - b.count);
      let firstEl = this.selectedPayment[0];
      exportString += ('Last Date: ' + firstEl.lastPayDate + '. Last Amount: ' + firstEl.prevAmount + '\n\n');
      exportString += ('[#' + firstEl.count + '] [' + firstEl.date + ']\n');
      exportString += (firstEl.prevAmount + ' ');
      let finalPayment = firstEl.prevAmount;
      this.selectedPayment.forEach((item) => {
        if (item.name != firstEl.name) error = true;
        if (item.type == 'in') {
          finalPayment -= item.amount;
          exportString += ('- ' + item.amount + ' ');
        } else {
          finalPayment += item.amount;
          exportString += ('+ ' + item.amount + ' ');
        }
      });

      if (error) {
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Different Payee Selected' });
        return;
      }
      exportString += ('= ' + finalPayment)
      this.clipboard.copy(exportString);
      const shareData: ShareData = {
        title: 'Payment Details',
        text: exportString
      }
      const shareMessage = await this.shareService.share(shareData);
      if (shareMessage.error) {
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: shareMessage.message });
      }
    }
  }

  deliveryStatus(flag: boolean) {
    if (!this.selectedPayment.length) {
      console.error('No Payment Selected');
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'No Payment Selected' });
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

    this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: 'function not defined' });


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
