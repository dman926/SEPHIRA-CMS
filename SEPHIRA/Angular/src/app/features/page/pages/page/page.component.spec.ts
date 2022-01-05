import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserTransferStateModule,
	DomSanitizer,
} from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { PostService } from 'src/app/core/services/post/post.service';

import { PageComponent } from './page.component';

describe('PageComponent', () => {
	let component: PageComponent;
	let fixture: ComponentFixture<PageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				BrowserTransferStateModule,
				HttpClientModule,
			],
			providers: [PostService, PlatformService],
			declarations: [PageComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
