import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminService } from 'src/app/admin/services/admin.service';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';

import { PostComponent } from './post.component';

describe('PostComponent', () => {
	let component: PostComponent;
	let fixture: ComponentFixture<PostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule, RouterTestingModule],
			providers: [
				AdminService,
				CoreService,
				PlatformService,
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							params: of({ postType: 'models.Page' }),
						},
					},
				},
			],
			declarations: [PostComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PostComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
