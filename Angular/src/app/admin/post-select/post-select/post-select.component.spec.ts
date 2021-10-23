import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSelectComponent } from './post-select.component';

describe('PostSelectComponent', () => {
  let component: PostSelectComponent;
  let fixture: ComponentFixture<PostSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
