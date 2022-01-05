import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlContainer, FormControl, FormControlDirective, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { ThemeService } from 'src/app/core/services/theme/theme.service';

import { WysiwygComponent } from './wysiwyg.component';

describe('WysiwygComponent', () => {
	let component: WysiwygComponent;
	let fixture: ComponentFixture<WysiwygComponent>;
	let formGroupDirective: FormControlDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule, NgxEditorModule],
			providers: [ThemeService, FormGroupDirective, {provide: ControlContainer, useValue: formGroupDirective}],
			declarations: [WysiwygComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(WysiwygComponent);
		component = fixture.componentInstance;

		const mockFormGroup = new FormGroup({
			test: new FormControl('')
		});
		component.rootFormGroup.form = mockFormGroup
		component.controlName = 'test';

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
