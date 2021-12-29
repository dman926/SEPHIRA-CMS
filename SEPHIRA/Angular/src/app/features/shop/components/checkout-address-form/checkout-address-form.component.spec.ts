import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutAddressFormComponent } from './checkout-address-form.component';

describe('CheckoutAddressFormComponent', () => {
  let component: CheckoutAddressFormComponent;
  let fixture: ComponentFixture<CheckoutAddressFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutAddressFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutAddressFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
