import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';
import { CartService } from '../../services/cart/cart.service';

import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
	let component: CheckoutComponent;
	let fixture: ComponentFixture<CheckoutComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				RouterTestingModule,
				BrowserTransferStateModule,
			],
			providers: [
				CartService,
				AuthService,
				ThemeService,
				PlatformService,
			],
			declarations: [CheckoutComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CheckoutComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
