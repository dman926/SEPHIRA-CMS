import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { AdminService } from 'src/app/admin/services/admin.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';

import { MenuItemsComponent } from './menu-items.component';

describe('MenuItemsComponent', () => {
	let component: MenuItemsComponent;
	let fixture: ComponentFixture<MenuItemsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule, BrowserTransferStateModule],
			providers: [AdminService, PlatformService],
			declarations: [MenuItemsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MenuItemsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
