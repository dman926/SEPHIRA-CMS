import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageSliderComponent } from './full-page-slider.component';

describe('FullPageSliderComponent', () => {
  let component: FullPageSliderComponent;
  let fixture: ComponentFixture<FullPageSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullPageSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullPageSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
