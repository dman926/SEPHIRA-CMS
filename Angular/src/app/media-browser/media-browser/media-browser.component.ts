import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FileService } from 'src/app/core/services/file.service';

@Component({
	selector: 'app-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss']
})
export class MediaBrowserComponent implements OnInit {

	@Output() selectedImage = new EventEmitter();

	files: string[];
	selected: number;

	gettingInformation: boolean;
	uploading: boolean;

	constructor(private fileService: FileService) {
		this.files = [];
		this.gettingInformation = true;
		this.selected = -1;
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
			this.uploading = true;
			this.fileService.upload(file).toPromise().then(res => {
				if (res) {
					this.getFiles();
				}
				this.uploading = false;
			}).catch(err => this.uploading = false);
		}
	}

}
