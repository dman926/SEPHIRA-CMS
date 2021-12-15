import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { Media } from 'src/app/models/media';
import { FileService } from '../../services/file/file.service';

@Component({
	selector: 'sephira-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss'],
})
export class MediaBrowserComponent implements OnInit {

	@ViewChild('fileUpload') fileUpload: HTMLInputElement | undefined;

	files: Media[];
	filteredFiles: Media[];
	filePageEvent: PageEvent;
	loaded: boolean;

	folder: string;

	uploading: boolean;
	uploadPercent: number;

	constructor(private file: FileService, private rootFormGrou: FormGroupDirective) {
		this.files = [];
		this.filteredFiles = [];
		this.filePageEvent = {
			pageIndex: 0,
			pageSize: 10,
			length: 0
		};
		this.loaded = false;
		this.folder = '';
		this.uploading = false;
		this.uploadPercent = 0;
	}

	ngOnInit(): void {
		
	}

	get shownFiles(): Media[] {
		const index = this.filePageEvent.pageIndex;
		const size = this.filePageEvent.pageSize;
		return this.filteredFiles.slice(index * size, index * size + size);
	}

	fetchFiles(event?: PageEvent): void {
		if (event) {
			this.filePageEvent = event;
			if (event.pageIndex * event.pageSize < this.files.length) {
				return;
			}
		}
		this.loaded = false;
		this.file.getMedia(this.filePageEvent.pageIndex, this.filePageEvent.pageSize).subscribe({
			next: files => {
				this.filePageEvent.length = files.count;
				this.files = this.files.concat(files.files);
				this.filterFiles();
				this.loaded = true;
			},
			error: err => this.loaded = true
		});
	}

	onFileUploaderSelected(event: any): void {
		const file: File = event.target.files[0];
		if (file) {
			this.uploadPercent = 0;
			this.uploading = true;
			const ratio = this.ratio;
			this.file.upload(file, this.folder, ratio === '*' ? undefined : ratio).subscribe({
				next: res => {
					if (res.type === HttpEventType.Response) {
						// Done uploading
						if (this.fileUpload) {
							this.fileUpload.value = '';
						}
						this.uploading = false;
						if (res.body) {
							this.files.unshift({ ratio: ratio, path: '/' + res.body });
							this.filterFiles();
						}
					} else if (res.type === HttpEventType.UploadProgress) {
						// Update progress
						if (res.total) {
							this.uploadPercent = 100 * res.loaded / res.total;
						}
					}
				},
				error: err => this.uploading = false
			});
		}
	}

	get ratio(): string {
		return '*';
	}

	private filterFiles(): void {
		const ratio = this.ratio;
		const out: Media[] = [];
		if (ratio === '*') {
			this.filteredFiles = this.files;
		} else {
			this.files.forEach(file => {
				if (file.ratio === ratio) {
					out.push(file);
				}
			});
			this.filteredFiles = out;
		}
	}

}
