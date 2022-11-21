import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardBillPaymentComponent } from './card-bill-payment.component';

describe('CardBillPaymentComponent', () => {
  let component: CardBillPaymentComponent;
  let fixture: ComponentFixture<CardBillPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardBillPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardBillPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
