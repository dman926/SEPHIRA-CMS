import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingZonesComponent } from './shipping-zones.component';

describe('ShippingZonesComponent', () => {
  let component: ShippingZonesComponent;
  let fixture: ComponentFixture<ShippingZonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingZonesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
