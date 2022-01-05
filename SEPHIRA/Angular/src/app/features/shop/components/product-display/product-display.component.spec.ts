import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service';

import { ProductDisplayComponent } from './product-display.component';

describe('ProductDisplayComponent', () => {
	let component: ProductDisplayComponent;
	let fixture: ComponentFixture<ProductDisplayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule, RouterTestingModule, BrowserTransferStateModule],
			providers: [ProductService, PlatformService, CartService],
			declarations: [ProductDisplayComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProductDisplayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
