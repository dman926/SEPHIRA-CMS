import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Media } from 'src/app/models/media';

interface DialogData {
	media: Media;
}

@Component({
	selector: 'sephira-metadata-editor',
	templateUrl: './metadata-editor.component.html',
	styleUrls: ['./metadata-editor.component.scss'],
})
export class MetadataEditorComponent {

	formGroup: FormGroup;
	image: boolean;
	video: boolean;
	audio: boolean;
	text: boolean;

	readonly audioKinds = ['alternative', 'descriptions', 'main', 'main-desc', 'translation', 'commentary']
	readonly textKinds = ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'];
	readonly modes = ['disabled', 'hidden', 'showing'];

	constructor(public dialogRef: MatDialogRef<MetadataEditorComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
		const mimetype: string | undefined = this.data.media.mimetype;
		const metadata = this.data.media.metadata;
		this.image = false;
		this.video = false;
		this.audio = false;
		this.text = false;
		if (this.isImage(mimetype)) {
			this.formGroup = new FormGroup({

			});
			this.image = true;
		} else if (this.isVideo(mimetype)) {
			this.formGroup = new FormGroup({

			});
			this.video = true
		} else if (this.isAudio(mimetype)) {
			this.formGroup = new FormGroup({
				audioKind: new FormControl(metadata?.audioKind ? metadata.audioKind : '', [Validators.required, this.audioKindValidator()]),
				srclang: new FormControl(metadata?.srclang ? metadata.srclang : '', [Validators.required]),
				label: new FormControl(metadata?.label ? metadata.label : '', [Validators.required]),
				default: new FormControl(metadata?.default ? metadata.default : false)
			});
			this.audio = true
		} else if (this.isText(mimetype)) {
			this.formGroup = new FormGroup({
				textKind: new FormControl(metadata?.textKind ? metadata.textKind : '', [Validators.required, this.textKindValidator()]),
				mode: new FormControl(metadata?.mode ? metadata.mode : '', [Validators.required, this.modeValidator()]),
				srclang: new FormControl(metadata?.srclang ? metadata.srclang : '', [Validators.required]),
				label: new FormControl(metadata?.label ? metadata.label : '', [Validators.required]),
				default: new FormControl(metadata?.default ? metadata.default : false)
			});
			this.text = true
		} else {
			this.formGroup = new FormGroup({});
		}
	}

	submit(): void {
		if (this.formGroup.valid) {
			this.dialogRef.close(this.formGroup.value);
		}
	}

	private isImage(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 5) === 'image';
		}
		return false;
	}

	private isVideo(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 5) === 'video';
		}
		return false;
	}

	private isText(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 4) === 'text';
		}
		return false;
	}

	private isAudio(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 5) === 'audio';
		}
		return false;
	}

	private audioKindValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (this.audioKinds.indexOf(control.value) === -1) {
				return { incorrectValue: true };
			}
			return null;
		}
	}

	private textKindValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (this.textKinds.indexOf(control.value) === -1) {
				return { incorrectValue: true };
			}
			return null;
		}
	}

	private modeValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (this.modes.indexOf(control.value) === -1) {
				return { incorrectValue: true }
			}
			return null;
		}
	}

}
