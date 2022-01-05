import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { SafeUrl } from '@angular/platform-browser';
import { retry } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { Payload, WebsocketService } from 'src/app/core/services/websocket/websocket.service';
import { ConfirmDialogComponent } from 'src/app/features/confirm/components/confirm-dialog/confirm-dialog.component';
import { VideoPlayerComponent } from 'src/app/features/video-player/components/video-player/video-player.component';
import { Media, Metadata } from 'src/app/models/media';
import { FileService } from '../../services/file/file.service';
import { AssociatedMediaDialogComponent } from '../associated-media-dialog/associated-media-dialog.component';
import { CreateFolderDialogComponent } from '../create-folder-dialog/create-folder-dialog.component';
import { MetadataEditorComponent } from '../metadata-editor/metadata-editor.component';

interface IUpdate {
	id: number;
	createTime: number;
	folder: string;
	created: boolean;
	opacity: number;
}

@Component({
	selector: 'sephira-media-browser',
	templateUrl: './media-browser.component.html',
	styleUrls: ['./media-browser.component.scss'],
})
export class MediaBrowserComponent implements OnInit, OnDestroy {

	@Input() formArrayName: string | undefined;
	@Input() allowMultiple: boolean;
	@Input() allowUpload: boolean;
	@Input() opened: boolean;
	@Input() showPreview: boolean;
	@Input() useSocket: boolean;

	@ViewChild('fileUpload') fileUpload: ElementRef | undefined;
	@ViewChild('player') player: VideoPlayerComponent | undefined;

	files: Media[];
	folders: Media[];
	loaded: boolean;

	folder: string;
	lastSelectedFile: Media | undefined;
	displayedImage: SafeUrl | string | undefined;
	imageLoaded: boolean;

	uploading: boolean;
	uploadPercent: number;

	formArray: FormArray | undefined;

	videoPlaying: boolean;
	
	showPrivate: boolean;
	sortType: string;
	sortDirection: string;
	sortFormControl: FormControl;

	websocket: WebSocketSubject<any> | null;
	updatedList: IUpdate[];
	now: number;
	readonly updatedListRemoveTime: number = 15; // in seconds

	constructor(
		public core: CoreService,
		private file: FileService,
		private platform: PlatformService,
		private ws: WebsocketService,
		private theme: ThemeService,
		private dialog: MatDialog,
		private rootFormGroup: FormGroupDirective) {
		this.allowMultiple = false;
		this.allowUpload = true;
		this.opened = false;
		this.showPreview = true;
		this.useSocket = true;

		this.files = [];
		this.folders = [];
		this.loaded = false;
		this.folder = '';
		this.imageLoaded = false;
		this.uploading = false;
		this.uploadPercent = 0;
		this.videoPlaying = false;
		
		this.showPrivate = false;
		this.sortType = 'filename';
		this.sortDirection = '';
		this.sortFormControl = new FormControl(this.sortType);

		this.websocket = null;
		this.now = Date.now();
		this.updatedList = [];
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			if (this.formArrayName) {
				this.formArray = this.rootFormGroup.control.get(this.formArrayName) as FormArray;
				if (!this.formArray) {
					throw new Error('`formArrayName` does not map to a valid form array');
				}
				this.sortFormControl.valueChanges.subscribe(sortType => {
					this.sortType = sortType;
					this.fetchFiles();
				});
				this.fetchFiles();
				if (this.useSocket) {
					this.websocket = this.ws.connect('media-browser');
					if (this.websocket) {
						this.websocket.pipe(retry()).subscribe((data: Payload) => {
							if (data.type === 'update') {
								const id = Math.trunc(Math.random() * 1000000);
								this.updatedList.push({
									id,
									createTime: this.now,
									folder: data.payload['folder'],
									created: data.payload['created'],
									opacity: 1
								});
								setTimeout(() => {
									this.removeUpdate(id);
								}, this.updatedListRemoveTime * 1000);
							} else if (data.type === 'processing update') {
								for (let i = 0; i < this.files.length; i++) {
									if (this.files[i].id === data.payload['id']) {
										this.files[i].percentDone = data.payload['percentDone'];
										break;
									}
								}
							}
						});
						this.ws.send(this.websocket, this.ws.createAuthPayload());
					}
					setInterval(() => {
						this.now = Date.now();
					}, 250);
				}
			} else {
				throw new Error('`formArrayName` is a required input');
			}
		}
	}

	ngOnDestroy(): void {
		if (this.websocket) {
			this.ws.close(this.websocket);
			this.websocket = null;
		}
	}

	fetchFiles(): void {
		this.loaded = false;
		this.files = [];
		this.folders = [];
		this.lastSelectedFile = undefined;
		this.displayedImage = undefined;
		this.file.getMedia(this.folder, undefined, this.showPrivate, this.sortDirection + this.sortType).subscribe({
			next: files => {
				files.forEach(file => {
					if (file.dir) {
						this.folders.push(file)
					} else {
						this.files.push(file);
					}
				});
				this.loaded = true;
			},
			error: err => this.loaded = true,
		});
	}

	onFileUploaderSelected(event: any): void {
		const file: File = event.target.files[0];
		if (this.fileUpload) {
			this.fileUpload.nativeElement.value = '';
		}
		if (file) {
			this.dialog.open(AssociatedMediaDialogComponent, {
				maxWidth: '800px',
				panelClass: this.theme.theme === 'light' ? '' : 'sephira-dark'
			}).afterClosed().subscribe((media: string[] | undefined) => {
				if (media) {
					this.uploadPercent = 0;
					this.uploading = true;
					this.file.upload(file, this.folder, media).subscribe({
						next: res => {
							if (res.type === HttpEventType.Response) {
								// Done uploading
								this.uploadPercent = 0;
								this.uploading = false;
								// TODO: think about manually inserting new media object	
								this.fetchFiles();
							} else if (res.type === HttpEventType.UploadProgress) {
								// Update progress
								if (res.total) {
									this.uploadPercent = 100 * res.loaded / res.total;
								}
							}
						},
						error: err => {
							this.uploadPercent = 0;
							this.uploading = false;
						}
					});
				}
			});
		}
	}

	editMetadata(): void {
		if (this.lastSelectedFile) {
			this.dialog.open(MetadataEditorComponent, {
				maxWidth: '600px',
				panelClass: this.theme.theme === 'light' ? '' : 'sephira-dark',
				data: { media: this.lastSelectedFile }
			}).afterClosed().subscribe((metadata: Metadata | undefined) => {
				if (metadata && this.lastSelectedFile && this.lastSelectedFile.id) {
					this.file.setMetadata(this.lastSelectedFile.id, metadata).subscribe(res => {
						if (res && this.lastSelectedFile) {
							this.lastSelectedFile.metadata = metadata;
						}
					});
				}
			});
		}
	}

	deleteLastSelectedFile(): void {
		if (this.lastSelectedFile) {
			this.dialog.open(ConfirmDialogComponent, {
				width: '250px',
				panelClass: this.theme.theme === 'light' ? '' : 'sephira-dark',
				data: {
					content: 'Are you sure you want to delete ' + this.lastSelectedFile.filename + '?',
					confirmText: 'Delete'
				}
			}).afterClosed().subscribe(confirm => {
				if (confirm && this.lastSelectedFile) {
					this.loaded = false;
					for (let i = 0; i < this.formArray!.length; i++) {
						const el: Media = this.formArray!.at(i).value;
						if (el.folder === this.lastSelectedFile.folder && el.filename === this.lastSelectedFile.filename) {
							this.formArray!.removeAt(i);
							break;
						}
					}
					if (this.player && this.videoPlaying) {
						this.player.resetPlayer();
					}
					this.file.deleteMedia(this.lastSelectedFile.folder, this.lastSelectedFile.filename).subscribe({
						next: res => {
							this.lastSelectedFile = undefined;
							this.displayedImage = undefined;
							this.fetchFiles();
						},
						error: err => {
							this.lastSelectedFile = undefined;
							this.displayedImage = undefined;
							this.loaded = true;
						}
					});
		
				}
			})
		}
	}

	openCreateFolder(): void {
		this.dialog.open(CreateFolderDialogComponent, {
			width: '250px',
			panelClass: this.theme.theme === 'light' ? '' : 'sephira-dark'
		}).afterClosed().subscribe(folder => {
			if (folder) {
				this.file.createFolder(this.folder ? this.folder + '/' + folder : folder).subscribe(res => {
					if (res) {
						// TODO: think about manually inserting media object
						this.fetchFiles();
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
					if (this.isVideo) {
						if (this.player) {
							this.player.addMedia(this.lastSelectedFile, true);
						}
						this.videoPlaying = true;
					} else {
						if (this.player && this.videoPlaying) {
							this.player.resetPlayer();
							this.videoPlaying = false;
						}
						this.file.getStream(this.lastSelectedFile.folder, this.lastSelectedFile.filename).subscribe(data => {
							if (data) {
								this.file.loadFileFromBlob(data, true).then(file => {
									this.displayedImage = file;
									this.imageLoaded = true;
								});
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
				if (this.player && this.videoPlaying) {
					this.player.resetPlayer();
					this.videoPlaying = false;
				}
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

	changeSortDirection(): void {
		this.sortDirection = this.sortDirection === '' ? '-' : ''
		this.files = this.files.reverse();
		this.folders = this.folders.reverse();
	}

	togglePrivateVisibility(): void {
		this.showPrivate = !this.showPrivate;
		this.fetchFiles();
	}

	removeUpdate(id: number): void {
		for (let i = 0; i < this.updatedList.length; i++) {
			if (this.updatedList[i].id === id) {
				this.updatedList[i].opacity = 0;
				setTimeout(() => {
					this.updatedList.splice(i, 1);
				}, 250);
				break;
			}
		}
	}

	get isVideo(): boolean {
		if (this.lastSelectedFile) {
			return this.lastSelectedFile.mimetype?.substring(0, 5) === 'video' || this.lastSelectedFile.container === true;
		}
		return false;
	}

	get isImg(): boolean {
		if (this.lastSelectedFile) {
			return this.lastSelectedFile.mimetype?.substring(0, 5) === 'image';
		}
		return false;
	}

}
