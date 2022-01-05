import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';

import { RecursiveMenuItemsComponent } from './recursive-menu-items.component';

describe('RecursiveMenuItemsComponent', () => {
	let component: RecursiveMenuItemsComponent;
	let fixture: ComponentFixture<RecursiveMenuItemsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatMenuModule],
			declarations: [RecursiveMenuItemsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RecursiveMenuItemsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
