import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderBarComponent } from './loader-bar.component';

describe('LoaderBarComponent', () => {
  let component: LoaderBarComponent;
  let fixture: ComponentFixture<LoaderBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoaderBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
