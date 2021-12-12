import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { Product } from 'src/app/models/posts/product';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/services/auth/auth.service';

@Injectable({
	providedIn: 'root',
})
export class CartService {

	private readonly cartBase = environment.apiServer + 'cart/';

	public cart$: Observable<CartItem[]>;

	private cartSubject: BehaviorSubject<CartItem[]>;

	constructor(private http: HttpClient, private auth: AuthService, private core: CoreService, private platform: PlatformService, private state: TransferState) {
		this.cartSubject = new BehaviorSubject<CartItem[]>(this.getLocalCart());
		this.cart$ = this.cartSubject.asObservable();
	}

	public setCart(cart: CartItem[]): void {
		localStorage.setItem('cart', JSON.stringify(cart));
		this.cartSubject.next(cart);
	}

	public getCart(): Observable<CartItem[]> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<CartItem[]>(this.cartBase + 'cart', { headers });
		} else {
			return of(this.getLocalCart());
		}
	}

	public removeFromCart(id: string, qty: number): void {
		const cart = this.getLocalCart();
		let flag = false;
		for (let i = 0; i < cart.length; i++) {
			if (cart[i].id === id) {
				flag = true;
				cart[i].qty -= qty;
				if (cart[i].qty <= 0) {
					cart.splice(i, 1);
				}
			}
		}
		if (!flag) {
			return;
		}
		localStorage.setItem('cart', JSON.stringify(cart));
		this.cartSubject.next(cart);
		const headers = this.core.createAuthHeader();
		if (headers) {
			this.http.put<string>(this.cartBase + 'cart', cart, { headers }).subscribe(res => {
				// TODO: try out manually changing the cart of the user object instead of refetching the user
				this.auth.getUser().subscribe(user => this.auth.setUser(user));
			});
		}
	}

	public addToCart(product: Product): void {
		const cart = this.getLocalCart();
		let flag = false;
		for (let i = 0; i < cart.length; i++) {
			if (cart[i].id === product.id) {
				flag = true;
				cart[i].qty++;
			}
		}
		if (!flag) {
			cart.push({id: product.id!, name: product.title ? product.title : '', price: product.price ? product.price : 0, qty: 1});
		}
		localStorage.setItem('cart', JSON.stringify(cart));
		this.cartSubject.next(cart);
		const headers = this.core.createAuthHeader();
		if (headers) {
			this.http.put<string>(this.cartBase + 'cart', cart, { headers }).subscribe(res => {
				// TODO: try out manually changing the cart of the user object instead of refetching the user
				this.auth.getUser().subscribe(user => this.auth.setUser(user));
			});
		}
	}

	public clearCart(): void {
		localStorage.setItem('cart', '[]');
		this.cartSubject.next([]);
		const headers = this.core.createAuthHeader();
		if (headers) {
			this.http.put<string>(environment.apiServer + 'cart/cart', [], { headers }).subscribe(res => {
				this.auth.getUser().subscribe(user => this.auth.setUser(user));
			});
		}
	}

	public getLocalCart(): CartItem[] {
		if (this.platform.isBrowser) {
			const user = this.state.get<User | null>(makeStateKey('user'), null);
			const prevCart = localStorage.getItem('cart');
			let cart;
			if (user) {
				cart = user.cart;
			} else if (prevCart) {
				cart = JSON.parse(prevCart);
			} else {
				cart = [];
			}
			return cart;	
		} else {
			return [];
		}
	}

}
