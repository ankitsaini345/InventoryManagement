import { Component, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { SpinnerService } from "./spinner.service";

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
  public isLoading = false;
  private loadingSubscription = new Subscription();

  constructor(private readonly spinnerService: SpinnerService) {
    this.loadingSubscription = this.spinnerService.isLoading$.subscribe(
      state => {
        console.log(state);
        this.isLoading = state;
      }
    );
  }

  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }
}

