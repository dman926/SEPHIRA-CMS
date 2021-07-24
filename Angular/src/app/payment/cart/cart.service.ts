import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PlatformService } from 'src/app/core/services/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { Product } from 'src/app/models/product';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class CartService {

	public cart$: Observable<CartItem[]>;

	private cartSubject: BehaviorSubject<CartItem[]>;

	constructor(private http: HttpClient, private auth: AuthService, private platformService: PlatformService) {
		this.cartSubject = new BehaviorSubject<CartItem[]>(this.getLocalCart());
		this.cart$ = this.cartSubject.asObservable();
	}

	public setCart(cart: CartItem[]): void {
		this.cartSubject.next(cart);
	}

	public getCart(): Observable<CartItem[]> {
		if (this.platformService.isServer()) {
			return of([]);
		}
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<CartItem[]>(environment.apiServer + 'cart/cart', { headers });
		} else {
			const cart = this.getLocalCart();
			return of(cart);
		}
	}

	public removeFromCart(id: string, qty: number) {
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

		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			this.http.put<string>(environment.apiServer + 'cart/cart', cart, { headers }).toPromise().then(res => {
				this.auth.getUser().toPromise().then(user => this.auth.setUser(user));
			});
		}


	}

	public addToCart(product: Product): void {
		const cart = this.getLocalCart();
		if (product.id) {
			let flag = false;
			for (let i = 0; i < cart.length; i++) {
				if (cart[i].id === product.id) {
					flag = true;
					cart[i].qty++;
				}
			}
			if (!flag) {
				cart.push({id: product.id, name: product.title ? product.title : '', price: product.price ? product.price : 0, qty: 1});
			}
			localStorage.setItem('cart', JSON.stringify(cart));

			this.cartSubject.next(cart);

			const accessToken = localStorage.getItem('accessToken');
			if (accessToken) {
				const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
				this.http.put<string>(environment.apiServer + 'cart/cart', cart, { headers }).toPromise().then(res => {
					this.auth.getUser().toPromise().then(user => this.auth.setUser(user));
				});
			}

		}
	}

	public clearCart(): void {
		this.cartSubject.next([]);
	}

	public getLocalCart(): CartItem[] {
		if (this.platformService.isBrowser()) {
			const user = localStorage.getItem('user');
			const prevCart = localStorage.getItem('cart');
			let cart;
			if (user) {
				cart = JSON.parse(user).cart;
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
