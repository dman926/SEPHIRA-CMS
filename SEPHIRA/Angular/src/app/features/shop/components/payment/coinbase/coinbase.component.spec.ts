import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CheckoutService } from '../../../services/checkout/checkout.service';

import { CoinbaseComponent } from './coinbase.component';

describe('CoinbaseComponent', () => {
	let component: CoinbaseComponent;
	let fixture: ComponentFixture<CoinbaseComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CheckoutService, CoreService, PlatformService],
			declarations: [CoinbaseComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CoinbaseComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
