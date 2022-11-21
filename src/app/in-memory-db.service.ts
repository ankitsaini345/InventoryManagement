import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import { IProduct } from './product/product';

export class InMemoryDataService implements InMemoryDbService {

  createDb(reqInfo?: RequestInfo | undefined): {} | Observable<{}> | Promise<{}> {
    const orders = [
      {
        "id": 1,
        "name": "test",
        "date": "test",
        "ram": 0,
        "storage": 0,
        "AppName": "test",
        "AppAccount": "test",
        "listPrice": 0,
        "cardAmount": 0,
        "costToMe": 0,
        "dPrice": 0,
        "coupon": 0,
        "giftBalence": 0,
        "cardDiscount": 0,
        "cardHolder": "test"
      },
      {
        "id": 2,
        "name": "test",
        "date": "test",
        "ram": 0,
        "storage": 0,
        "AppName": "test",
        "AppAccount": "test",
        "listPrice": 0,
        "cardAmount": 0,
        "costToMe": 0,
        "dPrice": 0,
        "coupon": 0,
        "giftBalence": 0,
        "cardDiscount": 0,
        "cardHolder": "test"
      }
    ]

    const cards = [
      {
        id: 1,
        cardName: 'Ankit_AxisFL',
        billDate: 15,
        dueDate: 4,
        amountDue: 1000,
        txns: [{
          txnDate: '2022-11-17',
          amount: 600,
          orderId: 2,
          OrderName: 'test'
        }]
      },
      {
        id: 2,
        cardName: 'Ankit_AxisAce',
        billDate: 15,
        dueDate: 5,
        amountDue: 3000,
        txns: []
      }
    ]

    return { orders, cards };

  }
}
