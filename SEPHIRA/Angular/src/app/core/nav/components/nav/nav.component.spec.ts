import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';
import { MenuItemService } from '../../services/menu-item/menu-item.service';

import { NavComponent } from './nav.component';

describe('NavComponent', () => {
	let component: NavComponent;
	let fixture: ComponentFixture<NavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				BrowserTransferStateModule,
				RouterTestingModule,
				MatSnackBarModule
			],
			providers: [
				MenuItemService,
				PlatformService,
				AuthService,
				ThemeService,
			],
			declarations: [NavComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
