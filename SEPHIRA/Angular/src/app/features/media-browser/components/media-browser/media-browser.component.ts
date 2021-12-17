import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { CoreService } from 'src/app/core/services/core/core.service';
import { VideoPlayerComponent } from 'src/app/features/video-player/components/video-player/video-player.component';
import { Media } from 'src/app/models/media';
import { FileService } from '../../services/file/file.service';
import { AssociatedMediaDialogComponent } from '../associated-media-dialog/associated-media-dialog.component';
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
	@Input() opened: boolean;
	@Input() showPreview: boolean;

	@ViewChild('fileUpload') fileUpload: ElementRef | undefined;
	@ViewChild('player') player: VideoPlayerComponent | undefined;

	files: Media[];
	folders: Media[];
	loaded: boolean;

	folder: string;
	lastSelectedFile: Media | undefined;
	displayedImage: any | undefined;
	imageLoaded: boolean;

	uploading: boolean;
	uploadPercent: number;

	formArray: FormArray | undefined;

	currentVideoSource: HTMLSourceElement | null;

	constructor(public core: CoreService, private file: FileService, private dialog: MatDialog, private rootFormGroup: FormGroupDirective, private sanitizer: DomSanitizer) {
		this.allowMultiple = false;
		this.allowUpload = true;
		this.opened = false;
		this.showPreview = true;

		this.files = [];
		this.folders = [];
		this.loaded = false;
		this.folder = '';
		this.imageLoaded = false;
		this.uploading = false;
		this.uploadPercent = 0;
		this.currentVideoSource = null;
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
		this.displayedImage = undefined;
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
		if (this.fileUpload) {
			this.fileUpload.nativeElement.value = '';
		}
		if (file) {
			this.dialog.open(AssociatedMediaDialogComponent, {
				maxWidth: '800px'
			}).afterClosed().subscribe((media: string[] | undefined) => {
				this.uploadPercent = 0;
				this.uploading = true;
				this.file.upload(file, this.folder, media).subscribe({
					next: res => {
						if (res.type === HttpEventType.Response) {
							// Done uploading
							this.uploadPercent = 0;
							this.uploading = false;
							if (res.body) {
								this.files.unshift(res.body);
							}
						} else if (res.type === HttpEventType.UploadProgress) {
							// Update progress
							if (res.total) {
								this.uploadPercent = 100 * res.loaded / res.total;
							}
						}
					},
					error: err => {
						console.error(err);
						this.uploadPercent = 0;
						this.uploading = false;
					}
				});
			});
		}
	}

	deleteLastSelectedFile(): void {
		if (this.lastSelectedFile) {
			this.loaded = false;
			for (let i = 0; i < this.formArray!.length; i++) {
				const el: Media = this.formArray!.at(i).value;
				if (el.folder === this.lastSelectedFile.folder && el.filename === this.lastSelectedFile.filename) {
					this.formArray!.removeAt(i);
					break;
				}
			}
			this.file.deleteMedia(this.lastSelectedFile.folder, this.lastSelectedFile.filename).subscribe({
				next: res => {
					this.files.splice(this.files.indexOf(this.lastSelectedFile!), 1);
					this.lastSelectedFile = undefined;
					this.displayedImage = undefined;
					this.loaded = true;
				},
				error: err => {
					this.lastSelectedFile = undefined;
					this.displayedImage = undefined;
					this.loaded = true;
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
						this.folders.push(res);
					}
				});
			}
		})
	}

	enterFolder(folder: MatSelectionListChange): void {
		if (folder.options.length > 0) {
			this.lastSelectedFile = undefined;
			this.displayedImage = undefined
			const value: Media = folder.options[0].value;
			if (value.owner === '' && value.folder === '..' && this.folder !== '') {
				const folder = this.folder.substring(0, this.folder.lastIndexOf('/'));
				if (folder === undefined) {
					this.folder = '';
				} else {
					this.folder = folder;
				}
			} else {
				this.folder = '';
				if (value.folder) {
					this.folder = value.folder + '/';
				}
				this.folder += value.filename;
			}
			this.fetchFiles();
		}
	}

	onFileSelected(file: MatSelectionListChange): void {
		if (file.options.length > 0) {
			const value: Media | undefined = file.options[0].value;
			if (value) {
				if (this.allowMultiple) {
					let foundIndex = -1;
					for (let i = 0; i < this.formArray!.length; i++) {
						const el: Media = this.formArray!.at(i).value;
						if (el.folder === value.folder && el.filename === value.filename) {
							foundIndex = i;
							break;
						}
					}
					if (foundIndex === -1) {
						this.formArray!.push(new FormControl(value.id, [Validators.required]));
					} else {
						this.formArray!.removeAt(foundIndex);
					}
				} else {
					if (this.formArray!.length > 0) {
						this.formArray!.at(0).setValue(value.id);
					} else {
						this.formArray!.push(new FormControl(value.id, [Validators.required]));
					}
				}

				if (file.options[0].selected) {
					this.lastSelectedFile = value;
					this.displayedImage = undefined;
					this.imageLoaded = false;
					console.log(this.player);
					if (this.isVideo) {
						this.displayedImage = this.file.getStreamUrl(this.lastSelectedFile.folder, this.lastSelectedFile.filename);
						if (this.player && this.lastSelectedFile.mimetype) {
							if (this.currentVideoSource) {
								this.player.removeSource(this.currentVideoSource);
							}
							this.currentVideoSource = this.player.addSource(this.displayedImage, this.lastSelectedFile.mimetype);
							this.imageLoaded = true;
						}
					} else {
						if (this.player) {
							if (this.currentVideoSource) {
								this.player.removeSource(this.currentVideoSource);
							}
							this.currentVideoSource = null;
						}
						this.file.getStream(this.lastSelectedFile.folder, this.lastSelectedFile.filename).subscribe(data => {
							if (data) {
								const reader = new FileReader();
								reader.onload = () => {
									this.displayedImage = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
									this.imageLoaded = true;
								};
								reader.readAsDataURL(data);
							}
						});
					}
				} else {
					this.lastSelectedFile = undefined;
					this.displayedImage = undefined;
				}
			} else {
				this.lastSelectedFile = undefined;
				this.displayedImage = undefined;
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

	get isVideo(): boolean {
		if (this.lastSelectedFile) {
			return this.lastSelectedFile.mimetype?.substring(0, 5) === 'video';
		}
		return false;
	}

}
