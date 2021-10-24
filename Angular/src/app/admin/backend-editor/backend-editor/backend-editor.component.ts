import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PlatformService } from 'src/app/core/services/platform.service';
import { AdminService } from '../../admin.service';
import { File } from '../../models/file';

@Component({
	selector: 'app-backend-editor',
	templateUrl: './backend-editor.component.html',	
	styleUrls: ['./backend-editor.component.scss']
})
export class BackendEditorComponent implements OnInit {

	files: File[];
	workingFiles: File[];
	currentDir: File | undefined;
	currentFile: File | undefined;
	formGroup: FormGroup;
	loadingFile: boolean;
	savingFile: boolean;
	savedFile: boolean;
	dirty: boolean;

	constructor(private admin: AdminService, private platform: PlatformService) {
		this.files = [];
		this.workingFiles = [];
		this.formGroup = new FormGroup({
			content: new FormControl('')
		});
		this.loadingFile = false;
		this.savingFile = false;
		this.savedFile = false;
		this.dirty = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser()) {
			this.admin.getBackendFiles().toPromise().then(files => {
				this.files = files;
				this.generateWorkingFiles();
			})
		}
	}

	restartServer(): void {
		this.admin.restartServer().toPromise().then(res => {
			this.dirty = false;
		});
	}

	saveFile(): void {
		if (this.currentFile) {
			this.savingFile = true;
			this.admin.saveBackendFile(this.currentFile.path, this.formGroup.get('content')!.value).toPromise().then(res => {
				this.savingFile = false;
				this.savedFile = true;
				this.dirty = true;
				setTimeout(() => this.savedFile = false, 3000);
			});
		}
	}

	openDir(file: File): void {
		if (file.isDir) {
			if (this.getFileName(file.path) === '..') {
				file.path = file.path.substr(0, file.path.lastIndexOf('/'));
			}
			this.currentDir = file;
			this.generateWorkingFiles();
		}
	}

	openFile(file: File): void {
		if (!file.isDir) {
			this.loadingFile = true;
			this.currentFile = file;
			this.admin.getBackendFile(file.path).toPromise().then(content => {
				this.formGroup.get('content')!.setValue(content);
				this.loadingFile = false;
			})
		}
	}

	private generateWorkingFiles(): void {
		if (this.currentDir) {
			const files: File[] = [{
				path: this.currentDir.path.substr(0, this.currentDir.path.lastIndexOf('/')) + '/..',
				isDir: true
			}];
			if (files[0].path === '/..') {
				files[0].children = this.files;
			} else {
				const parent: File | null = this.getFileParent(this.currentDir);
				if (parent) {
					files[0].children = parent.children;
				}
			}
			this.workingFiles = files.concat(this.currentDir.children!);
		} else {
			this.workingFiles = this.files;
		}
	}

	private getFileParent(file: File): File | null {
		let parent: File | null = null;
		let files = this.files;
		const fileSplit = file.path.substr(1).split('/');
		fileSplit.slice(0, fileSplit.length - (file.isDir ? 1 : 0)).forEach(pathPart => {
			for (const searchingFile of files!) {
				if (this.getFileName(searchingFile.path) === pathPart) {
					parent = searchingFile;
					files = parent.children ? parent.children : [];
					break;
				}
			}
		});
		return parent;
	}

	getFileName(path: string): string {
		return path.substr(path.lastIndexOf('/') + 1)
	}

}
