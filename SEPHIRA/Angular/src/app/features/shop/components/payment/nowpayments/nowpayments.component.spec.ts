import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NowpaymentsComponent } from './nowpayments.component';

describe('NowpaymentsComponent', () => {
  let component: NowpaymentsComponent;
  let fixture: ComponentFixture<NowpaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NowpaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NowpaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
