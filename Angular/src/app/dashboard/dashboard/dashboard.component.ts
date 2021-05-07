import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Card } from 'src/app/models/card';
import { CardService } from '../card.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	isHandset: boolean;
	gettingCards: boolean;
	selectingMedia: boolean;

	cards: Card[];

	constructor(private breakpointObserver: BreakpointObserver, private cardService: CardService) {
		this.isHandset = false;
		this.gettingCards = true;
		this.selectingMedia = false;
		this.cards = [];
		this.breakpointObserver.observe(Breakpoints.Handset).pipe(
			map(({ matches }) => {
				this.isHandset = matches;
			})
		);
	}

	ngOnInit(): void {
		this.cardService.getCards().toPromise().then(cards => {
			this.cards = cards;
			console.log(this.cards);
			this.gettingCards = false;
		});
	}

	addCard(): void {
		const card: Card = {
			name: 'Card ' + this.cards.length,
			content: 'Content Here',
			width: ((this.cards.length - 1) % 3 === 1) ? 2 : 1,
			height: 1
		};
		this.cardService.addCard(card).toPromise().then(res => {
			if (res) {
				this.cardService.getCards().toPromise().then(cards => {
					this.cards = cards;
					this.gettingCards = false;
				});
			}
		});
	}

	removeCard(id: string | undefined): void {
		this.cardService.deleteCard(id).toPromise().then(res => {
			if (res) {
				this.cardService.getCards().toPromise().then(cards => {
					this.cards = cards;
					this.gettingCards = false;
				});
			}
		});
	}

	onSelectedImage(url: string) {
		console.log(url);
	}

}
