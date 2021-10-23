import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
import { PostService } from 'src/app/core/services/post.service';
import { Product } from 'src/app/models/product';
import { CartService } from 'src/app/payment/cart/cart.service';
import { ProductService } from '../product.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
	selector: 'app-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {

	loaded: boolean;
	products: Product[];
	productPageEvent: PageEvent;
	productCount: number;
	private searchTerm: string | undefined;
	private subs: Subscription[];

	constructor(private postService: PostService, private productService: ProductService, public cartService: CartService, private platformService: PlatformService, private route: ActivatedRoute) {
		this.loaded = false;
		this.products = [];
		this.productPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.productCount = 0;
		this.subs = [];
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.subs.push(this.route.queryParams.subscribe(params => {
				this.searchTerm = params.s;
				this.resetProducts();
				this.fetchProducts();
			}));
		}
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	get shownProducts(): Product[] {
		const index = this.productPageEvent.pageIndex;
		const size = this.productPageEvent.pageSize;
		return this.products.slice(index * size, index * size + size);
	}

	fetchProducts(event?: PageEvent): void {
		if (event) {
			this.productPageEvent = event;
			if (event.pageIndex * event.pageSize < this.products.length) {
				return;
			}
		}
		this.loaded = false;
		this.postService.getPosts('models.Product', this.productPageEvent.pageIndex, this.productPageEvent.pageSize, this.searchTerm).toPromise().then(res => {
			this.productCount = res.total;
			this.products = this.products.concat(res.posts);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	private resetProducts(): void {
		this.products = [];
		this.productCount = 0;
		this.productPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
	}

}
