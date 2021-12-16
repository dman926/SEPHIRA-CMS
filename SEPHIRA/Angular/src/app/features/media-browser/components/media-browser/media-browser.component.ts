import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { CoreService } from 'src/app/core/services/core/core.service';
import { Media } from 'src/app/models/media';
import { FileService } from '../../services/file/file.service';
import { CreateFolderDialogComponent } from '../create-folder-dialog/create-folder-dialog.component';

@Component({
	selector: 'sephira-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss'],
})
export class MediaBrowserComponent implements OnInit {

	@Input() formArrayName: string | undefined;
	@Input() allowMultiple: boolean;
	@Input() allowUpload: boolean;

	@ViewChild('fileUpload') fileUpload: ElementRef | undefined;

	files: Media[];
	folders: Media[];
	loaded: boolean;

	folder: string;
	lastSelectedFile: Media | undefined;

	uploading: boolean;
	uploadPercent: number;

	formArray: FormArray | undefined;

	constructor(public core: CoreService, private file: FileService, private dialog: MatDialog, private rootFormGroup: FormGroupDirective) {
		this.allowMultiple = false;
		this.allowUpload = true;

		this.files = [];
		this.folders = [];
		this.loaded = false;
		this.folder = '';
		this.uploading = false;
		this.uploadPercent = 0;
	}

	ngOnInit(): void {
		if (this.formArrayName) {
			this.formArray = this.rootFormGroup.control.get(this.formArrayName) as FormArray;
			if (!this.formArray) {
				throw new Error('`formArrayName` does not map to a valid form array');
			}
			this.fetchFiles();
		} else {
			throw new Error('`formArrayName` is a required input');
		}
	}

	fetchFiles(): void {
		this.loaded = false;
		this.files = [];
		this.folders = [];
		this.lastSelectedFile = undefined;
		this.file.getMedia(this.folder).subscribe({
			next: files => {
				files.forEach(file => {
					if (file.dir) {
						this.folders.push(file)
					} else {
						this.files.push(file);
					}
				})
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
							this.fileUpload.nativeElement.value = '';
						}
						this.uploading = false;
						if (res.body) {
							const obj: Media = {
								path: '/' + res.body.path,
								size: res.body.size
							};
							if (res.body.ratio) {
								obj.ratio = res.body.ratio;
							}
							this.files.unshift(obj);
						}
					} else if (res.type === HttpEventType.UploadProgress) {
						// Update progress
						if (res.total) {
							this.uploadPercent = 100 * res.loaded / res.total;
						}
					}
				},
				error: err => {
					if (this.fileUpload) {
						this.fileUpload.nativeElement.value = '';
					}
					console.error(err);
					this.uploading = false;
				}
			});
		}
	}

	openCreateFolder(): void {
		this.dialog.open(CreateFolderDialogComponent, {
			width: '250px'
		}).afterClosed().subscribe(folder => {
			if (folder) {
				this.file.createFolder(this.folder ? this.folder + '/' + folder : folder).subscribe(res => {
					if (res) {
						this.folders.push({ path: this.folder ? this.folder + '/' + folder : folder, size: 0, dir: true });
					}
				});
			}
		})
	}

	enterFolder(folder: MatSelectionListChange): void {
		if (folder.options.length > 0) {
			const value: string = folder.options[0].value;
			if (value === '..' && this.folder) {
				this.folder = this.folder.substring(0, this.folder.lastIndexOf('/'));
			} else {
				let count = 0;
				let i = 0;
				// find the start index of the actual subfolder
				while (count < 4 && (i = value.indexOf('/', i) + 1)) {
					count++;
				}
				this.folder = value.substring(i);
			}
			this.fetchFiles();
		}
	}

	onFileSelected(file: MatSelectionListChange): void {
		if (file.options.length > 0) {
			const value: Media = file.options[0].value;

			if (this.allowMultiple) {
				let foundIndex = -1;
				for (let i = 0; i < this.formArray!.length; i++) {
					if (this.formArray!.at(i).value === value.path) {
						foundIndex = i;
						break;
					}
				}
				if (foundIndex === -1) {
					this.formArray!.push(new FormControl(value.path, [Validators.required]));
				} else {
					this.formArray!.removeAt(foundIndex);
				}
			} else {
				if (this.formArray!.length > 0) {
					this.formArray!.at(0).setValue(value.path);
				} else {
					this.formArray!.push(new FormControl(value.path, [Validators.required]));
				}
			}

			if (file.options[0].selected) {
				this.lastSelectedFile = value;	
			} else {
				this.lastSelectedFile = undefined;
			}
		}
	}

	isSelected(path: string): boolean {
		for (let i = 0; i < this.formArray!.length; i++) {
			if (this.formArray!.at(i).value === path) {
				return true;
			}
		}
		return false;
	}

	get ratio(): string {
		return '*';
	}

}
