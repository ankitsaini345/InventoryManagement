import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTxnsComponent } from './card-txns.component';

describe('CardTxnsComponent', () => {
  let component: CardTxnsComponent;
  let fixture: ComponentFixture<CardTxnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardTxnsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardTxnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
