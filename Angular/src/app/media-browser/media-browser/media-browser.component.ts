import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileService } from 'src/app/core/services/file.service';

@Component({
	selector: 'app-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss']
})
export class MediaBrowserComponent implements OnInit {

	@Output() selectedImage = new EventEmitter();

	@ViewChild('fileUpload') fileUpload: ElementRef | null;

	files: string[];
	selected: number;

	gettingInformation: boolean;
	uploadPercent: number;
	uploading: boolean;

	constructor(private fileService: FileService) {
		this.fileUpload = null;
		this.files = [];
		this.gettingInformation = true;
		this.selected = -1;
		this.uploadPercent = 0;
		this.uploading = false;
	}

	ngOnInit(): void {
		this.getFiles();
	}

	getFiles(): void {
		this.fileService.getMedia().toPromise().then(files => {
			if (files) {
				this.files = files;
			}
			this.gettingInformation = false;
		});
	}

	selectFile(index: number) {
		this.selected = index;
		this.selectedImage.emit(window.location.origin + this.files[index]);
	}

	uploadFile() {

	}

	deleteFile(index: number) {
		const filename = this.files[index].substr(this.files[index].lastIndexOf('/') + 1);
		this.fileService.deleteFile(filename).toPromise().then(res => {
			console.log(res);
			this.getFiles();
		});
	}

	getOrigin() {
		return window.location.origin;
	}

	onFileUploaderSelected(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			this.uploadPercent = 0;
			this.uploading = true;
			this.fileService.upload(file).subscribe(res => {
				if (res.type === HttpEventType.Response) {
					// Done uploading
					if (this.fileUpload) {
						this.fileUpload.nativeElement.value = '';
					}
					this.uploading = false;
					if (res) {
						this.getFiles();
					}
				} else if (res.type === HttpEventType.UploadProgress) {
					// Update progress
					if (res.total) {
						this.uploadPercent = 100 * res.loaded / res.total;
						console.log(this.uploadPercent);
					}
				}
			}, err => this.uploading = false);
		}
	}

}
