import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Iresult } from '../product/Iresult';
import { IPayee } from './payee';

@Injectable({
  providedIn: 'root'
})
export class PayeeService {

  private StorageString = 'inventoryPayee';

  constructor(private http: HttpClient,
    private messageService: MessageService
  ) {
  }

  private url = environment.baseUrl + 'api/payees';
  private payeeData$ = new BehaviorSubject<IPayee[]>([]);
  private uniquePayeeName$ = new BehaviorSubject<string[]>([]);
  private pendingAmount$ = new BehaviorSubject<any>({
    distributor: 0,
    others: 0
  });

  reload() {
    localStorage.removeItem(this.StorageString);
    this.initialiseData();
  }

  async initialiseData() {
    try {
      let data = localStorage.getItem(this.StorageString);
      let dataArray: IPayee[];
      if (data) {
        dataArray = JSON.parse(data);
        this.payeeData$.next(dataArray);
        this.calcStats();
      } else {
        dataArray = await firstValueFrom(this.http.get<IPayee[]>(this.url));
        this.payeeData$.next(dataArray);
        this.calcStats();
        localStorage.setItem(this.StorageString, JSON.stringify(dataArray));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payee Initialised' });
      }

      let uniqueProductArray = this.extractFieldArray(dataArray, 'name');
      this.uniquePayeeName$.next(uniqueProductArray);

    } catch (error: any) {
      console.error(error);
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Error in initialising Payee: ' + error.message });
    }
  }

  calcStats() {
    let stats = {
      distributor: 0,
      others: 0,
      personal: 0
    }

    this.payeeData$.getValue().forEach((payee)=> {
      if(payee.name == 'Amit Aryangr') stats.distributor = payee.totalAmount;
      else if(payee.name == 'Personal' || payee.name == 'Others') stats.personal += payee.totalAmount;
      else stats.others += payee.totalAmount;
    });

    this.pendingAmount$.next(stats);
  }

  getPendingAmount() {
    return this.pendingAmount$.asObservable();
  }

  getPayees(): Observable<IPayee[]> {
    return this.payeeData$.asObservable();
  }

  getUniquePayeeNames(): Observable<string[]> {
    // const uniqueProductUrl = this.url + '/unique/' + field;
    return this.uniquePayeeName$.asObservable();
  }

  getPayee(_id: string): IPayee {
    if (_id == 'new') return this.blank();
    else {
      return this.payeeData$.getValue().find(p => p._id == _id)!;
    }
  }

  getPayeeByName(name: string): IPayee {
      return this.payeeData$.getValue().find(p => p.name == name)!;
  }

  async addPayee(payee: IPayee) {
    try {
      const res: Iresult = await firstValueFrom(this.http.post<Iresult>(this.url, payee));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payee ' + payee.name + ' added.' });
        localStorage.removeItem(this.StorageString);
        this.initialiseData();
      } else {
        this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Acknowledge failed: add Payee ' + payee.name });
        console.error('Acknowledge failed: add Payee ' + payee.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unable to add Payee ' + payee.name + ' Error: ' + error.message });
      console.error('Unable to add Payee ' + payee.name + ' Error: ', error);
    }
  }

  async editPayee(payee: IPayee, init = true) {
    try {
      const res: Iresult = await firstValueFrom(this.http.put<Iresult>(this.url + '/' + payee._id, payee));
      if (res.acknowledged && res.modifiedCount) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payee ' + payee.name + ' Updated.' });
        if (init) {
          localStorage.removeItem(this.StorageString);
          this.initialiseData();
        }
      } else {
        this.messageService.add({ severity: 'info', life:15000, summary: 'Info', detail: 'Modified Count 0. Payee ' + payee.name });
        console.error('Unable to add Payee ' + payee.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to Update Payee ' + payee.name + ' Error: ' + error.message });
      console.error('Unable to add Payee ' + payee.name + ' Error: ', error);
    }

  }

  async deletePayee(payee: IPayee) {
    try {
      const res: Iresult = await firstValueFrom(this.http.delete<Iresult>(this.url + '/' + payee._id));
      if (res.acknowledged) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payee ' + payee.name + ' deleted.' });
        localStorage.removeItem(this.StorageString);
        this.initialiseData();
      } else {
        this.messageService.add({ severity: 'error', life:15000, summary: 'Error', detail: 'Unable to delete Payee ' + payee.name });
        console.error('Unable to add Payee ' + payee.name + ' Error: ', res);
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Unable to delete Payee ' + payee.name + ' Error: ' + error.message });
      console.error('Unable to add Payee ' + payee.name + ' Error: ', error);
    }
  }

  extractFieldArray(items: IPayee[], fieldName: string): string[] {
    let resArray: string[] = [];
    items.forEach((item: any) => {
      let field = item[fieldName];
      if (!(resArray.includes(field)))
        resArray.push(field);
    })
    return resArray;
  }

  blank(): IPayee {
    return {
      _id: 'new',
      lastPaymentDate: '',
      name: '',
      totalAmount: 0,
      pendingComm: 0,
      lastPaymentNum: 0,
      lastPaidAmount: 0,
      tillDate: 0
    }
  }

}