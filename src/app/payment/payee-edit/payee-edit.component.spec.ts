import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayeeEditComponent } from './payee-edit.component';

describe('PayeeEditComponent', () => {
  let component: PayeeEditComponent;
  let fixture: ComponentFixture<PayeeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayeeEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayeeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
