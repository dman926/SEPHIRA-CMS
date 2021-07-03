import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutRedirectComponent } from './checkout-redirect.component';

describe('CheckoutRedirectComponent', () => {
  let component: CheckoutRedirectComponent;
  let fixture: ComponentFixture<CheckoutRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
