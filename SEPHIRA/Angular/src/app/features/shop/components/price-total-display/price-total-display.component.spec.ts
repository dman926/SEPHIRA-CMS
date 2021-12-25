import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceTotalDisplayComponent } from './price-total-display.component';

describe('PriceTotalDisplayComponent', () => {
  let component: PriceTotalDisplayComponent;
  let fixture: ComponentFixture<PriceTotalDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceTotalDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceTotalDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
