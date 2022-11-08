import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';

export class InMemoryDataService implements InMemoryDbService {

  createDb(reqInfo?: RequestInfo | undefined): {} | Observable<{}> | Promise<{}> {
    const products = [
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

    return { products };

  }
}
