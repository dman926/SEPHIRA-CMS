import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponComponent } from './coupon.component';

describe('CouponComponent', () => {
  let component: CouponComponent;
  let fixture: ComponentFixture<CouponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CouponComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
