import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-star-rating',
	templateUrl: './star-rating.component.html',
	styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {

	@Input('rating') rating: number;
	@Input('starCount') starCount: number;
	@Input('color') color: string;
	@Output() private ratingUpdated = new EventEmitter();

	ratingArr: number[] = [];

	constructor() {
		this.rating = 0;
		this.starCount = 5;
		this.color = 'primary';
	}

	ngOnInit() {
		for (let index = 0; index < this.starCount; index++) {
			this.ratingArr.push(index);
		}
	}
	
	onClick(rating: number): void {
		this.rating = rating;
		this.ratingUpdated.emit(rating);
	}

}
