import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'sephira-star-rating',
	templateUrl: './star-rating.component.html',
	styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent implements OnInit {

	@Input('rating') rating: number;
	@Input('starCount') starCount: number;
	@Input('color') color: string;
	@Output() ratingUpdated: EventEmitter<number>;

	ratingArr: number[];

	constructor() {
		this.rating = 0;
		this.starCount = 5;
		this.color = 'primary';
		this.ratingUpdated = new EventEmitter<number>();
		this.ratingArr = [];
	}

	ngOnInit(): void {
		for (let i = 0; i < this.starCount; i++) {
			this.ratingArr.push(i);
		}
	}

	onClick(rating: number): void {
		this.rating = rating;
		this.ratingUpdated.emit(rating);
	}

}
