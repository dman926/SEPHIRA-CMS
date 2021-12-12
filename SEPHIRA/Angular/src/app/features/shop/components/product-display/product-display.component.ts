import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { Product } from 'src/app/models/posts/product';
import { Review } from 'src/app/models/review';
import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service';

@Component({
	selector: 'sephira-product-display',
	templateUrl: './product-display.component.html',
	styleUrls: ['./product-display.component.scss'],
})
export class ProductDisplayComponent implements OnInit {

	@Input() product: Product | null;
	@Input() card: boolean;

	selectedImg: number;
	reviews: Review[];
	reviewAllowed: boolean;
	reviewForm: FormGroup;
	reviewPageEvent: PageEvent;
	reviewsLoaded: boolean;

	private readonly reviewsStateKey = makeStateKey<Review[]>('reviews');
	private readonly reviewCountStateKey = makeStateKey<number>('reviewCount');
	private readonly reviewAllowedStateKey = makeStateKey<boolean>('reviewAllowed');

	constructor(private productService: ProductService, private platform: PlatformService, private state: TransferState, public cart: CartService, public router: Router) {
		this.product = null;
		this.card = false;
		this.selectedImg = 0;
		this.reviews = [];
		this.reviewAllowed = false;
		this.reviewForm = new FormGroup({
			score: new FormControl('', [Validators.required]),
			review: new FormControl('')
		});
		this.reviewPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10
		};
		this.reviewsLoaded = false;
	}

	ngOnInit(): void {
		if (!this.card && this.product) {
			if (this.platform.isServer) {
				this.fetchReviews();
			} else {
				const reviews = this.state.get(this.reviewsStateKey, null);
				const reviewCount = this.state.get(this.reviewCountStateKey, null);
				const reviewAllowed = this.state.get(this.reviewAllowedStateKey, null);
				if (reviews !== null && reviewCount !== null && reviewAllowed !== null) {
					this.reviews = reviews;
					this.reviewPageEvent.length = reviewCount;
					this.reviewAllowed = reviewAllowed;
				} else {
					this.fetchReviews();
				}
			}
		}
	}

	fetchReviews(event?: PageEvent): void {
		if (event) {
			this.reviewPageEvent = event;
			if (event.pageIndex * event.pageSize < this.reviews.length) {
				return;
			}
		}
		this.reviewsLoaded = false;
		this.productService.getReviews(this.product!.id!, this.reviewPageEvent.pageIndex, this.reviewPageEvent.pageSize).subscribe({
			next: reviews => {
				this.reviews = this.reviews.concat(reviews.reviews);
				this.reviewPageEvent.length = reviews.count;
				this.reviewAllowed = reviews.allowed;
				this.state.set(this.reviewsStateKey, reviews.reviews);
				this.state.set(this.reviewCountStateKey, reviews.count);
				this.state.set(this.reviewAllowedStateKey, reviews.allowed);
				this.reviewsLoaded = true;
			},
			error: err => this.reviewsLoaded = true
		});
	}

}
