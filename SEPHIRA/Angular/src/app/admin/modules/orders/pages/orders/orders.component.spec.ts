import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminService } from 'src/app/admin/services/admin.service';

import { OrdersComponent } from './orders.component';

describe('OrdersComponent', () => {
	let component: OrdersComponent;
	let fixture: ComponentFixture<OrdersComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [AdminService],
			declarations: [OrdersComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OrdersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
