import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/product';
import { CartService } from 'src/app/payment/cart/cart.service';

@Component({
	selector: 'app-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {

	@Input() color: string;
	@Input() product: Product | null;

	slug: string;

	private subs: Subscription[];

	constructor(private route: ActivatedRoute, private cartService: CartService) {
		this.color = '';
		this.product = null;
		this.slug = '';
		this.subs = [];
	}

	ngOnInit(): void {
		if (!this.product) {
			this.subs.push(this.route.params.subscribe((params: Params) => {
				this.slug = params.slug;
			}));
		}
	}

	ngOnDestroy() {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	addToCart(product?: Product) {
		if (product) {
			this.cartService.addToCart(product);
		}
	}

}
