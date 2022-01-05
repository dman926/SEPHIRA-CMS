import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CheckoutService } from '../../../services/checkout/checkout.service';

import { PaypalComponent } from './paypal.component';

describe('PaypalComponent', () => {
	let component: PaypalComponent;
	let fixture: ComponentFixture<PaypalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CheckoutService, CoreService, PlatformService],
			declarations: [PaypalComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PaypalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
