import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { FileService } from 'src/app/features/media-browser/services/file/file.service';

import { VideoPlayerComponent } from './video-player.component';

describe('VideoPlayerComponent', () => {
	let component: VideoPlayerComponent;
	let fixture: ComponentFixture<VideoPlayerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [FileService, PlatformService],
			declarations: [VideoPlayerComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(VideoPlayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
