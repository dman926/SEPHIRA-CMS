import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';

import { RedirectComponent } from './redirect.component';

describe('RedirectComponent', () => {
	let component: RedirectComponent;
	let fixture: ComponentFixture<RedirectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [PlatformService],
			declarations: [RedirectComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RedirectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
