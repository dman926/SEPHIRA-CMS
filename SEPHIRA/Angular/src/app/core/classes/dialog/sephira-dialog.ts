import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ThemeService } from 'src/app/core/services/theme/theme.service';

@Injectable()
export class SephiraDialog {
	
	constructor(private dialog: MatDialog, private theme: ThemeService) { }

	open(component: ComponentType<unknown>, config: MatDialogConfig = {}): MatDialogRef<unknown, any> {
		if (this.theme.theme !== 'light') {
			if (!config.panelClass) {
				config.panelClass = 'sephira-dark';
			} else if (typeof config.panelClass === 'string') {
				config.panelClass = [config.panelClass, 'sephira-dark'];
			} else {
				config.panelClass.push('sephira-dark');
			}
		}
		return this.dialog.open(component, config);
	}

}
