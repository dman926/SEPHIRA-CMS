import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminService } from 'src/app/admin/services/admin.service';

import { ShippingZonesComponent } from './shipping-zones.component';

describe('ShippingZonesComponent', () => {
	let component: ShippingZonesComponent;
	let fixture: ComponentFixture<ShippingZonesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule, RouterTestingModule],
			providers: [AdminService],
			declarations: [ShippingZonesComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ShippingZonesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
