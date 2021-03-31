import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

	@Input() id: any;
	@Input() name: string;
	@Input() content: string;

	constructor() {
		this.id = null;
		this.name = '';
		this.content = '';
	}

	ngOnInit(): void {
		console.log(this.id);
		console.log(this.name);
		console.log(this.content);
	}

}
