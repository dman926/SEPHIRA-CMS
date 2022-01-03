import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { PostService } from 'src/app/core/services/post/post.service';
import { Product } from 'src/app/models/posts/product';

@Component({
	selector: 'sephira-shop',
	templateUrl: './shop.component.html',
	styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit, OnDestroy {

	products: Product[];
	productPageEvent: PageEvent;
	product: Product | null;
	isProduct: boolean;
	searchTerm: string;
	loaded: boolean;

	private querySub: Subscription | undefined;
	private readonly productsStateKey = makeStateKey<Product[]>('products');
	private readonly productCountStateKey = makeStateKey<number>('productCount');
	private readonly productStateKey = makeStateKey<Product>('product');

	constructor(private post: PostService, private route: ActivatedRoute, private platform: PlatformService, private state: TransferState) {
		this.products = [];
		this.productPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10
		};
		this.product = null;
		this.isProduct = false;
		this.searchTerm = '';
		this.loaded = false;
	}

	ngOnInit(): void {
		this.querySub = this.route.queryParams.subscribe(params => {
			if (params['p']) {
				// Is individual product page
				this.isProduct = true;
				if (this.platform.isServer) {
					this.fetchProduct(params['p']);
				} else {
					const product = this.state.get(this.productStateKey, null);
					if (product) {
						this.product = product;
						this.loaded = true;
					} else {
						this.fetchProduct(params['p']);
					}
				}
			} else {
				// Is main shop page
				this.isProduct = false;
				if (params['s']) {
					this.searchTerm = params['s'];
				}
				this.resetProducts();
				if (this.platform.isServer) {
					this.fetchProducts();
				} else {
					const products = this.state.get(this.productsStateKey, null);
					const productCount = this.state.get(this.productCountStateKey, null);
					if (products !== null && productCount !== null) {
						this.products = products;
						this.productPageEvent.length = productCount;
						this.loaded = true;
					} else {
						this.fetchProducts();
					}
				}
			}
		});
	}

	ngOnDestroy(): void {
		this.querySub?.unsubscribe();
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
		this.post.getPosts('models.Product', this.productPageEvent.pageIndex, this.productPageEvent.pageSize, this.searchTerm).subscribe({
			next: res => {
				this.productPageEvent.length = res.total;
				this.products = this.products.concat(res.posts);
				this.state.set(this.productsStateKey, this.products);
				this.state.set(this.productCountStateKey, this.productPageEvent.length);
				this.loaded = true;
			},
			error: err => {
				this.product = null;
				this.loaded = true;
			}
		});
	}

	private fetchProduct(slug: string): void {
		this.loaded = false;
		this.post.getPostFromSlug('models.Product', slug).subscribe({
			next: product => {
				this.product = product;
				this.state.set(this.productStateKey, product);
				this.loaded = true;
			},
			error: err => {
				this.loaded = true;
			}
		});
	}

	private resetProducts(): void {
		this.products = [];
		this.productPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10
		};
	}

}
