import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	ControlContainer,
	FormArray,
	FormGroup,
	FormGroupDirective,
	ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { WebsocketService } from 'src/app/core/services/websocket/websocket.service';
import { FileService } from '../../services/file/file.service';

import { MediaBrowserComponent } from './media-browser.component';

describe('MediaBrowserComponent', () => {
	let component: MediaBrowserComponent;
	let fixture: ComponentFixture<MediaBrowserComponent>;
	let formGroupDirective: FormGroupDirective;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				RouterTestingModule,
				MatDialogModule,
				ReactiveFormsModule,
				MatSelectModule,
				BrowserAnimationsModule,
			],
			providers: [
				CoreService,
				FileService,
				PlatformService,
				WebsocketService,
				ThemeService,
				FormGroupDirective,
				{ provide: ControlContainer, useValue: formGroupDirective },
			],
			declarations: [MediaBrowserComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MediaBrowserComponent);
		component = fixture.componentInstance;

		const mockFormGroup = new FormGroup({
			test: new FormArray([]),
		});
		component['rootFormGroup'].form = mockFormGroup;
		component.formArrayName = 'test';

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
