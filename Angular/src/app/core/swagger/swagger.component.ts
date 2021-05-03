import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SwaggerUIBundle } from 'swagger-ui-dist';

@Component({
	selector: 'app-swagger',
	templateUrl: './swagger.component.html',
	styleUrls: ['./swagger.component.scss']
})
export class SwaggerComponent implements OnInit {

	constructor() { }

	ngOnInit(): void {
		SwaggerUIBundle({
			domNode: document.getElementById('swagger-ui-item'),
			url: environment.socketServer + '/api/spec.json'
		  });
	}
}
