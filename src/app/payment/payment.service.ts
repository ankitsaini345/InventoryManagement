import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Iresult } from '../product/Iresult';
import { IPayment } from './payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  private PaymentStorageString = 'inventoryPayments';
  private url = environment.baseUrl + 'api/payments'

  private paymentData$ = new BehaviorSubject<IPayment[]>([]);
  private uniqueReceiverName$ = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient,
    private messageService: MessageService) {
    // this.initialisePaymentData();
  }

  getPayments(): Observable<IPayment[]> {
    return this.paymentData$.asObservable();
  }

  async initialisePaymentData() {
    let payments = sessionStorage.getItem(this.PaymentStorageString);
    let paymentsArray: IPayment[];
    if (payments) {
      paymentsArray = JSON.parse(payments);
      this.paymentData$.next(paymentsArray);
    } else {
      paymentsArray = await firstValueFrom(this.http.get<IPayment[]>(this.url));
      sessionStorage.setItem(this.PaymentStorageString, JSON.stringify(paymentsArray));
      this.paymentData$.next(paymentsArray);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payments Data Initialised' });
    }
    let uniqueReceiverArray = this.extractFieldArray(paymentsArray, 'receiver');
    this.uniqueReceiverName$.next(uniqueReceiverArray);
  }
  extractFieldArray(items: IPayment[], fieldName: string): string[] {
    let resArray: string[] = [];
    items.forEach((item: any) => {
      let field = item[fieldName];
      if (!(resArray.includes(field)))
        resArray.push(field);
    })
    return resArray;
  }

  getUniqueReceiver(): Observable<string[]> {
    return this.uniqueReceiverName$.asObservable();
  }

  getPaymentbyId(_id: string): IPayment {
    if (_id == 'new') return this.blankPayment();
    else {
      return this.paymentData$.getValue().find(p => p._id == _id)!;
    }
  }

  getPaymentByName(name: string): IPayment[] {
    return this.paymentData$.getValue().filter(p => p.name == name)!;
  }

  async addPayment(payment: IPayment, init = true) {
    try {
      let res: Iresult = await firstValueFrom(this.http.post<Iresult>(this.url, payment));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment for : ' + payment.name + ' added.' });
        if (init) {
          sessionStorage.removeItem(this.PaymentStorageString);
          this.initialisePaymentData();
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to add payment for: ' + payment.name + ' Error: ' + error.message });
    }
  }

  async updatePayment(payment: IPayment, init = true) {
    try {
      let res: Iresult = await firstValueFrom(this.http.put<Iresult>(this.url + '/' + payment._id, payment));
      if (res.acknowledged) {
        if (res.matchedCount && res.modifiedCount) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment for: ' + payment.name + ' Updated.' });
          if (init) {
            sessionStorage.removeItem(this.PaymentStorageString);
            this.initialisePaymentData();
          }
        } else {
          console.error(payment.name + ': Not matched with any existing payment user');
          this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: payment.name + ': Not matched with any existing payment user' });
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to update payment: ' + payment.name + ' Error: ' + error.message });
    }
  }


  async deletePayment(payment: IPayment, init = true) {
    try {
      let res: Iresult = await firstValueFrom(this.http.delete<Iresult>(this.url + '/' + payment._id));
      if (res.acknowledged && res.deletedCount) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment for: ' + payment.name + ' deleted.' });
        if (init) {
          sessionStorage.removeItem(this.PaymentStorageString);
          this.initialisePaymentData();
        }
      } else throw res;
    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to delete payment for: ' + payment.name + ' Error: ' + error.message });
    }
  }

  blankPayment(): IPayment {
    return {
      _id: 'new',
      name: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      percent: 0,
      paymentMode: '',
      receiver: ''
    }
  }
}
