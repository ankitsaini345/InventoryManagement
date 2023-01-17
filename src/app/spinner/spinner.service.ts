import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingEvent$ = new Subject<boolean>();
  public isLoading$ = this.loadingEvent$.asObservable();

  constructor() {}

  public startLoading() {
    this.loadingEvent$.next(true);
  }

  public finishLoading() {
    this.loadingEvent$.next(false);
  }
}
