import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedMediaDialogComponent } from './associated-media-dialog.component';

describe('AssociatedMediaDialogComponent', () => {
  let component: AssociatedMediaDialogComponent;
  let fixture: ComponentFixture<AssociatedMediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociatedMediaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedMediaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
