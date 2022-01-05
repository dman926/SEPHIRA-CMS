import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminService } from 'src/app/admin/services/admin.service';

import { PostsComponent } from './posts.component';

describe('PostsComponent', () => {
	let component: PostsComponent;
	let fixture: ComponentFixture<PostsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				RouterTestingModule,
				BrowserTransferStateModule,
			],
			providers: [
				AdminService,
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							params: of({ postType: 'models.Page' }),
						},
					},
				},
			],
			declarations: [PostsComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PostsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
