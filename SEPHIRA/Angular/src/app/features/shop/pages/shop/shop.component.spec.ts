import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PostService } from 'src/app/core/services/post/post.service';
import { of } from 'rxjs';

import { ShopComponent } from './shop.component';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

describe('ShopComponent', () => {
	let component: ShopComponent;
	let fixture: ComponentFixture<ShopComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				BrowserTransferStateModule,
				RouterTestingModule,
			],
			providers: [PostService],
			declarations: [ShopComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ShopComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
