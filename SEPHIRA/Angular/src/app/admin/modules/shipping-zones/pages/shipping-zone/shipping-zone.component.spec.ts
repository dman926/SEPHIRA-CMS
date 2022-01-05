import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminService } from 'src/app/admin/services/admin.service';

import { ShippingZoneComponent } from './shipping-zone.component';

describe('ShippingZoneComponent', () => {
	let component: ShippingZoneComponent;
	let fixture: ComponentFixture<ShippingZoneComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RouterTestingModule, HttpClientModule],
			providers: [AdminService],
			declarations: [ShippingZoneComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ShippingZoneComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
