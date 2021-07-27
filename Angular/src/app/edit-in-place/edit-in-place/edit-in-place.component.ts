import { AfterContentInit, Component, ContentChild, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { filter, switchMapTo, take } from 'rxjs/operators';
import { EditModeDirective } from '../edit-mode.directive';
import { ViewModeDirective } from '../view-mode.directive';

@Component({
	selector: 'app-edit-in-place',
	templateUrl: './edit-in-place.component.html',
	styleUrls: ['./edit-in-place.component.scss']
})
export class EditInPlaceComponent implements OnInit, OnDestroy {
	@Output() update = new EventEmitter();
	@ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective | undefined;
	@ContentChild(EditModeDirective) editModeTpl: EditModeDirective | undefined;

	mode: 'view' | 'edit' = 'view';

	editMode = new Subject();
	editMode$ = this.editMode.asObservable();

	private viewModeSub: Subscription | null;
	private editModeSub: Subscription | null;

	constructor(private host: ElementRef) {
		this.viewModeSub = null
		this.editModeSub = null;
	}

	ngOnInit() {
		this.viewModeHandler();
		this.editModeHandler();
	}

	ngOnDestroy() {
		this.viewModeSub?.unsubscribe();
		this.editModeSub?.unsubscribe();
	}

	get currentView() {
		return this.mode === 'view' ? this.viewModeTpl?.tpl : this.editModeTpl?.tpl;
	}

	private get element() {
		return this.host.nativeElement;
	}

	private viewModeHandler() {
		this.viewModeSub = fromEvent(this.element, 'dblclick').subscribe(() => {
			this.mode = 'edit';
			this.editMode.next(true);
		});
	}

	private editModeHandler() {
		const clickOutside$ = fromEvent(document, 'click').pipe(
			filter(({ target }) => this.element.contains(target) === false),
			take(1)
		);

		this.editModeSub = this.editMode$.pipe(
			switchMapTo(clickOutside$),
		).subscribe(event => {
			this.update.next();
			this.mode = 'view';
		});
	}

}
