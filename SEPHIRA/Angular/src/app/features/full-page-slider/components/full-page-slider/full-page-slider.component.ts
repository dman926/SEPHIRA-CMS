import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { Slide } from 'src/app/models/slide';

@Component({
	selector: 'app-full-page-slider',
	templateUrl: './full-page-slider.component.html',
	styleUrls: ['./full-page-slider.component.scss'],
	animations: [
		trigger('showHidden', [
			state('show', style({
				width: '100%'
			})),
			state('oldShow', style({
				width: '100%'
			})),
			state('hidden', style({
				width: '0'
			})),
			transition('hidden => show', animate('1s 0s ease-in-out'))
		]),
		trigger('progressBar', [
			state('*', style({
				width: '0'
			})),
			state('show', style({
				width: '100%'
			})),
			transition('* => show', animate('2s 1s linear')),
			transition('show => *', animate('0.5s 0s linear'))
		])
	]
})
export class FullPageSliderComponent implements OnInit, OnDestroy {

	@Input() slides: Slide[];
	@Input() msOnSlides: number;
	animationStates: string[];

	private goingToSlide: boolean;
	private currentSlide: number;
	private intervalSubscription: Subscription | null;

	constructor(private platform: PlatformService) {
		this.slides = [];
		this.msOnSlides = 3000;
		this.animationStates = []
		this.goingToSlide = false;
		this.currentSlide = 0;
		this.intervalSubscription = null;
	}

	ngOnInit(): void {
		for (let i = 0; i < this.slides.length; i++) {
			if (i === 0) {
				this.animationStates[i] = 'show';
			} else if (i === this.slides.length - 1) {
				this.animationStates[i] = 'oldShow';
			} else {
				this.animationStates[i] = 'hidden';
			}
		}
		if (this.platform.isBrowser) {
			this.intervalSubscription = this.createTimer();
		}
	}

	ngOnDestroy(): void {
		this.intervalSubscription?.unsubscribe();
	}

	private createTimer(): Subscription {
		return timer(this.msOnSlides, this.msOnSlides).subscribe(() => {
			if (this.currentSlide === 0) {
				this.animationStates[this.slides.length - 1] = 'hidden';
			} else {
				this.animationStates[this.currentSlide - 1] = 'hidden';
			}
			this.animationStates[this.currentSlide] = 'oldShow';
			this.currentSlide++;
			if (this.currentSlide === this.slides.length) {
				this.currentSlide = 0;
			}
			this.animationStates[this.currentSlide] = 'show';
			let bottomTexts = Array.prototype.slice.call(document.getElementsByTagName('p'));
			bottomTexts.forEach(tag => {
				tag.style.color = this.slides[this.currentSlide].bottomText?.selectedColor;
			});
		});
	}

	goToSlide(index: number): void {
		if (this.goingToSlide) {
			return;
		}
		this.goingToSlide = true;
		for (let i = 0; i < this.animationStates.length; i++) {
			if (this.animationStates[i] === 'oldShow') {
				this.animationStates[i] = 'hidden';
			}
		}
		this.animationStates[this.currentSlide] = 'oldShow'
		this.currentSlide = index;
		this.animationStates[this.currentSlide] = 'show'
		this.intervalSubscription?.unsubscribe();
		this.intervalSubscription = this.createTimer();
		let bottomTexts = Array.prototype.slice.call(document.getElementsByTagName('p'));
		bottomTexts.forEach(tag => {
			tag.style.color = this.slides[this.currentSlide].bottomText?.selectedColor;
		});
		setTimeout(() => {
			this.goingToSlide = false;
		}, this.msOnSlides);
	}

}
