import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpDialogComponent } from './otp-dialog.component';

describe('OtpDialogComponent', () => {
  let component: OtpDialogComponent;
  let fixture: ComponentFixture<OtpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
