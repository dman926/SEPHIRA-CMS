import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	ControlContainer,
	FormArray,
	FormGroup,
	FormGroupDirective,
	ReactiveFormsModule,
} from '@angular/forms';
import { AdminService } from 'src/app/admin/services/admin.service';

import { PostSelectComponent } from './post-select.component';

describe('PostSelectComponent', () => {
	let component: PostSelectComponent;
	let fixture: ComponentFixture<PostSelectComponent>;
	let formGroupDirective: FormGroupDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule, ReactiveFormsModule],
			providers: [
				AdminService,
				FormGroupDirective,
				{ provide: ControlContainer, useValue: formGroupDirective },
			],
			declarations: [PostSelectComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PostSelectComponent);
		component = fixture.componentInstance;

		const mockFormGroup = new FormGroup({
			test: new FormArray([]),
		});
		component['rootFormGroup'].form = mockFormGroup;
		component.formArrayName = 'test';
		component.type = 'models.Page';

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
