import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxnListComponent } from './txn-list.component';

describe('TxnListComponent', () => {
  let component: TxnListComponent;
  let fixture: ComponentFixture<TxnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TxnListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TxnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
