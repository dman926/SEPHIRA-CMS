import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from 'src/app/models/menu-item';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class MenuItemService {

	private readonly menuItemBase: string = 'menuItems';

	constructor(private http: HttpClient) { }

	public getMenuItems(): Observable<MenuItem[]> {
		return this.http.get<MenuItem[]>(environment.apiServer + this.menuItemBase);
	}

}
