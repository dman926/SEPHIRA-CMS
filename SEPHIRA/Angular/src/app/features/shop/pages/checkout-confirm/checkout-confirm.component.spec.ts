import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { WebsocketService } from 'src/app/core/services/websocket/websocket.service';
import { CheckoutService } from '../../services/checkout/checkout.service';

import { CheckoutConfirmComponent } from './checkout-confirm.component';

describe('CheckoutConfirmComponent', () => {
	let component: CheckoutConfirmComponent;
	let fixture: ComponentFixture<CheckoutConfirmComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				RouterTestingModule,
				BrowserTransferStateModule,
			],
			providers: [WebsocketService, CheckoutService, PlatformService],
			declarations: [CheckoutConfirmComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CheckoutConfirmComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
