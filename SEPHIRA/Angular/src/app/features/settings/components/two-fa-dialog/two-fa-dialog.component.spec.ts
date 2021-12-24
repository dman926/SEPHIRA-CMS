import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFaDialogComponent } from './two-fa-dialog.component';

describe('TwoFaDialogComponent', () => {
  let component: TwoFaDialogComponent;
  let fixture: ComponentFixture<TwoFaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoFaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
