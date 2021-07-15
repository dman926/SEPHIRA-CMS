import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingZoneComponent } from './shipping-zone.component';

describe('ShippingZoneComponent', () => {
  let component: ShippingZoneComponent;
  let fixture: ComponentFixture<ShippingZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShippingZoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
