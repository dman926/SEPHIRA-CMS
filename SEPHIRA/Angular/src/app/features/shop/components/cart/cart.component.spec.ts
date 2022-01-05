import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CartService } from '../../services/cart/cart.service';

import { CartComponent } from './cart.component';

describe('CartComponent', () => {
	let component: CartComponent;
	let fixture: ComponentFixture<CartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				BrowserTransferStateModule,
				RouterTestingModule,
				MatMenuModule,
			],
			providers: [CartService],
			declarations: [CartComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
