import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ShareService } from 'src/app/share.service';
import { IPayment } from '../payment';
import { PaymentService } from '../payment.service';
import { PayeeService } from '../payee.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit, OnDestroy {
  constructor(private paymentService: PaymentService,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private shareService: ShareService,
    private payeeService: PayeeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
  }

  private PaymentStorageString = 'inventoryPayments';

  showPayStringDialog = {
    visible: false,
    payee: '',
    paymentString: ''
  }
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


  mode = ["phonePe", "Gpay", "Payee", "Paytm", "Cash", "Card", "LIC", "Order", "Others"];

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

  formatDate(str: any, regular = false) {
    let date = new Date(str);
    let month: any = date.getMonth() + 1;
    let day: any = date.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }
    if (regular) return day + '-' + month + '-' + date.getFullYear();
    return date.getFullYear() + '-' + month + '-' + day;
  }

  async exportData(includeCom = false) {
    try {
      if (!this.selectedPayment.length) {
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No Payment Selected' });
      } else {
        let exportString = '';
        let lastDate = '';
        this.selectedPayment.sort((a, b) => a.count - b.count);
        let firstEl = this.selectedPayment[0];
        // exportString += ('[Last Date: ' + this.formatDate(firstEl.lastPayDate, true) + '] [Last Amount: ' + firstEl.prevAmount + ']\n');
        // exportString += ('[#' + firstEl.count + '] [' + firstEl.date + ']\n');
        // exportString += (firstEl.prevAmount + ' ');
        let calculatedAmount = firstEl.prevAmount;
        let calculationString = calculatedAmount + ' ';
        this.selectedPayment.forEach((item) => {

          if (item.name != firstEl.name) throw new Error('Different Payee Selected');

          if (lastDate != item.date) {
            lastDate = item.date;
            exportString += ('\n[' + this.formatDate(item.date, true) + '] ')
          }
          if (item.type == 'in') {
            calculatedAmount -= item.amount;
            // exportString += ('- ' + item.amount + ' ');
            exportString += ('-' + item.amount + ' ');
            calculationString += ('- ' + item.amount + ' ');
          } else {
            calculatedAmount += item.amount;
            // exportString += ('+ ' + item.amount + ' ');
            exportString += ('+' + item.amount + ' ')
            calculationString += ('+ ' + item.amount + ' ');
          }
          if (includeCom && item.cashback) exportString += ('(' + item.cashback + ') ')
        });
        exportString += ('\n\n' + calculationString + '= ' + calculatedAmount)
        // exportString += ('\n\n[Total] = ' + calculatedAmount)
        let payee = this.payeeService.getPayeeByName(firstEl.name);
        if (includeCom)
          exportString += ('\n[Pending Commision] = ' + payee.pendingComm);
        if (payee.totalAmount != calculatedAmount)
          this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Final Price Mismatch' });

        this.showPayStringDialog.visible = true;
        this.showPayStringDialog.payee = firstEl.name;
        this.showPayStringDialog.paymentString = exportString;
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: error.message });
    }
  }

  async paymentOverlayAction(exportString: string, copy: boolean, share: boolean) {
    if (copy) this.clipboard.copy(exportString);
    if (share) {
      const shareData: ShareData = {
        title: 'Payment Details',
        text: exportString
      }
      const shareMessage = await this.shareService.share(shareData);
      if (shareMessage.error) {
        this.messageService.add({ severity: 'error', life: 15000, summary: 'Error', detail: shareMessage.message });
      }
    }
    this.showPayStringDialog.visible = false;
    this.showPayStringDialog.payee = '';
    this.showPayStringDialog.paymentString = '';
  }


  // async bulkStatusChange() {
  // if (!this.selectedPayment.length) {
  //   this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No Payment Selected' });
  // } 
  //   // let promiseArray: Promise<any>[] = [];
  //   console.log('pending comm');

  //   let Comm = 0;
  //   let newArr = this.selectedPayment.slice();
  //   newArr.sort((a, b) => a.count - b.count);
  //   newArr.forEach((payment: IPayment) => {
  //     console.log(payment.name);

  //     if (payment.name == 'Vivek') {
  //       Comm += payment.cashback;
  //       if (!payment.pendingCommision) {
  //         payment.pendingCommision = Comm;
  //         this.paymentService.updatePayment(payment, false);
  //       }
  //     }
  //   });
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
