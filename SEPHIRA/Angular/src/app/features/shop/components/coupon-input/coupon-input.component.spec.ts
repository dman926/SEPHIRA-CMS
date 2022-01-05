import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CartService } from '../../services/cart/cart.service';

import { CouponInputComponent } from './coupon-input.component';

describe('CouponInputComponent', () => {
	let component: CouponInputComponent;
	let fixture: ComponentFixture<CouponInputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				RouterTestingModule,
				BrowserTransferStateModule,
			],
			providers: [CartService],
			declarations: [CouponInputComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CouponInputComponent);
		component = fixture.componentInstance;

		component.orderID = '123';

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
