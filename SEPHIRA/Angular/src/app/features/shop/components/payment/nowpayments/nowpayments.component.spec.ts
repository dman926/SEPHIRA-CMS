import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CheckoutService } from '../../../services/checkout/checkout.service';

import { NowpaymentsComponent } from './nowpayments.component';

describe('NowpaymentsComponent', () => {
	let component: NowpaymentsComponent;
	let fixture: ComponentFixture<NowpaymentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CheckoutService, CoreService, PlatformService],
			declarations: [NowpaymentsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NowpaymentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
