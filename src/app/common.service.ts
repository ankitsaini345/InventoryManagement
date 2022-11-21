import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  // generateId(): string {
  //   const ObjectId = (m = Math, d = Date, h = 16, s = (s: any) => m.floor(s).toString(h)) =>
  //     s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

  //     return new ObjectId();
  // }
}
