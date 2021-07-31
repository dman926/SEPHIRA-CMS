import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { FileService } from 'src/app/core/services/file.service';
import { Media } from 'src/app/models/media';

@Component({
	selector: 'app-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss']
})
export class MediaBrowserComponent implements OnInit {

	@Output() selectedImage = new EventEmitter();
	@Input() isThumbnail: boolean;
	@Input() defaultSelected: string | string[];
	@Input() ratio: string;
	@Input() multipleSelect: boolean;

	@ViewChild('fileUpload') fileUpload: ElementRef | null;

	files: Media[];
	selected: number | number[];

	gettingInformation: boolean;
	uploadPercent: number;
	uploading: boolean;

	constructor(private fileService: FileService) {
		this.isThumbnail = false;
		this.defaultSelected = '';
		this.ratio = '*';
		this.multipleSelect = false;
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
				if (this.multipleSelect) {
					this.selected = [];
				}
				for (let i = 0; i < this.files.length; i++) {
					if (this.multipleSelect) {
						if (this.defaultSelected.indexOf(this.files[i].path) !== -1) {
							(this.selected as number[]).push(i);
							this.selectedImage.emit(this.files[i].path);
						}
					} else {
						if (this.files[i].path === this.defaultSelected) {
							this.selected = i;
							this.selectedImage.emit(this.files[i].path);
							break;
						}
					}
				}
			}
			this.gettingInformation = false;
		});
	}

	selectFile(index: number) {
		if (this.multipleSelect) {
			const foundAt = this.arraySelected.indexOf(index);
			if (foundAt === -1) {
				this.arraySelected.push(index)
			} else {
				this.arraySelected.splice(foundAt, 1);
			}
		} else {
			this.selected = index;
		}
		this.selectedImage.emit(this.files[index].path);
	}

	deleteFile(index: number) {
		const filename = this.files[index].path.substr(this.files[index].path.lastIndexOf('/') + 1);
		this.fileService.deleteFile(filename).toPromise().then(res => {
			this.getFiles();
		});
	}

	onFileUploaderSelected(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			this.uploadPercent = 0;
			this.uploading = true;
			this.fileService.upload(file, this.isThumbnail).subscribe(res => {
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

	get arraySelected(): number[] {
		return this.selected as number[];
	}

}
