import { Component, ContentChild, ElementRef, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { filter, fromEvent, Observable, Subject, Subscription, switchMapTo, take } from 'rxjs';
import { EditModeDirective } from '../../directives/edit-mode.directive';
import { ViewModeDirective } from '../../directives/view-mode.directive';

@Component({
	selector: 'app-edit-in-place',
	templateUrl: './edit-in-place.component.html',
	styleUrls: ['./edit-in-place.component.scss'],
})
export class EditInPlaceComponent implements OnInit {

	@Output() update: EventEmitter<any>;
	@ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective | undefined;
	@ContentChild(EditModeDirective) editModeTpl: EditModeDirective | undefined;
	
	mode: 'view' | 'edit';

	editMode: Subject<any>;
	editMode$: Observable<any>;

	constructor(private host: ElementRef) {
		this.update = new EventEmitter();
		this.mode = 'view';
		this.editMode = new Subject();
		this.editMode$ = this.editMode.asObservable();
	}

	ngOnInit(): void {
		this.viewModeHandler();
		this.editModeHandler();
	}

	get currentView(): TemplateRef<any> | undefined {
		return this.mode === 'view' ? this.viewModeTpl?.tpl : this.editModeTpl?.tpl;
	}

	private get element(): any {
		return this.host.nativeElement;
	}

	private viewModeHandler(): void {
		fromEvent(this.element, 'dblclick').subscribe(() => {
			this.mode = 'edit';
			this.editMode.next(true);
		});
	}

	private editModeHandler(): void {
		const clickOutside$ = fromEvent(document, 'click').pipe(
			filter(({ target }) => this.element.contains(target) === false),
			take(1)
		);

		this.editMode$.pipe(
			switchMapTo(clickOutside$)
		).subscribe(event => {
			this.update.next(null);
			this.mode = 'view';
		})
	}

}
