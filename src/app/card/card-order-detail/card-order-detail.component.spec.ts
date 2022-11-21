import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOrderDetailComponent } from './card-order-detail.component';

describe('CardOrderDetailComponent', () => {
  let component: CardOrderDetailComponent;
  let fixture: ComponentFixture<CardOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardOrderDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
