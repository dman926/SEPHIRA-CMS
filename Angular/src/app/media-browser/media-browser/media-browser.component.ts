import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, Output, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { FileService } from 'src/app/core/services/file.service';
import { Media } from 'src/app/models/media';

@Component({
	selector: 'app-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss']
})
export class MediaBrowserComponent implements OnInit, OnDestroy {

	@Input() formArrayName: string | null;
	@Input() allowMultiple: boolean;

	@ViewChild('fileUpload') fileUpload: ElementRef | undefined;

	files: Media[];
	filteredFiles: Media[];
	filePageEvent: PageEvent;
	loaded: boolean;

	uploadPercent: number;
	uploading: boolean;

	formArray: FormArray | undefined;
	formGroup: FormGroup;

	private ratioChangeSub: Subscription | undefined;

	constructor(private fileService: FileService, private rootFormGroup: FormGroupDirective) {
		this.formArrayName = null;
		this.allowMultiple = false;
		this.files = [];
		this.filteredFiles = [];
		this.filePageEvent = {
			pageIndex: 0,
			pageSize: 10,
			length: 0
		};
		this.uploadPercent = 0;
		this.uploading = false;
		this.loaded = false;
		this.formGroup = new FormGroup({
			isThumbnail: new FormControl(false),
			ratio: new FormControl('*')
		});
	}

	ngOnInit(): void {
		if (this.formArrayName) {
			this.formArray = this.rootFormGroup.control.get(this.formArrayName) as FormArray;
			this.formGroup.get('ratio')!.valueChanges.subscribe(val => {
				this.filterFiles(val);
			});
			this.fetchFiles();
		} else {
			throw new Error('`formArrayName` is a required input');
		}
	}

	ngOnDestroy(): void {
		this.ratioChangeSub?.unsubscribe();
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
		this.fileService.getMedia(this.filePageEvent.pageIndex, this.filePageEvent.pageSize).toPromise().then(files => {
			this.filePageEvent.length = files.count;
			this.files = this.files.concat(files.files);
			this.filterFiles(this.ratio);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	onFileUploaderSelected(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			this.uploadPercent = 0;
			this.uploading = true;
			const isThumbnail = this.formGroup.get('isThumbnail')!.value;
			this.fileService.upload(file, isThumbnail).subscribe(res => {
				if (res.type === HttpEventType.Response) {
					// Done uploading
					if (this.fileUpload) {
						this.fileUpload.nativeElement.value = '';
					}
					this.uploading = false;
					if (res) {
						this.files.unshift({ ratio: isThumbnail ? '1' : '16/9', path: '/' + res.body! });
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
	
	selectFile(filename: string) {
		if (this.allowMultiple) {
			let foundIndex = -1
			for (let i = 0; i < this.formArray!.length; i++) {
				if (this.formArray!.at(i).value === filename) {
					foundIndex = i;
					break;
				}
			}
			if (foundIndex >= 0) {
				this.formArray!.removeAt(foundIndex);
			} else {
				this.formArray!.push(new FormControl(filename, [Validators.required]));
			}
		} else {
			if (this.formArray!.length > 0) {
				this.formArray!.at(0).setValue(filename);
			} else {
				this.formArray!.push(new FormControl(filename, [Validators.required]));
			}
		}
	}

	deleteFile(media: Media) {
		const filename = media.path.substr(media.path.lastIndexOf('/') + 1);
		this.fileService.deleteFile(filename).toPromise().then(res => {
			this.files.splice(this.files.indexOf(media), 1);
			this.filterFiles(this.ratio);
		});
	}

	isSelected(filename: string): boolean {
		for (let i = 0; i < this.formArray!.length; i++) {
			if (this.formArray!.at(i).value === filename) {
				return true;
			}
		}
		return false;
	}

	get ratio(): string {
		return this.formGroup.get('ratio')!.value;
	}

	private filterFiles(ratio: string): void {
		const out: Media[] = [];
		this.files.forEach(file => {
			if (ratio === '*') {
				out.push(file);
			} else {
				if (file.ratio === ratio) {
					out.push(file);
				}
			}
		});
		this.filteredFiles = out;
	}

}
