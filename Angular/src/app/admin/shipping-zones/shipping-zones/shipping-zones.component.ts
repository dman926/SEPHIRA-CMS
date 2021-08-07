import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
	selector: 'app-shipping-zones',
	templateUrl: './shipping-zones.component.html',
	styleUrls: ['./shipping-zones.component.scss']
})
export class ShippingZonesComponent implements OnInit {

	loaded: boolean;
	shippingZones: ShippingZone[];

	shippingZonePageEvent: PageEvent;
	shippingZoneCount: number;

	constructor(private admin: AdminService, private router: Router) {
		this.loaded = false;
		this.shippingZones = [];
		this.shippingZonePageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.shippingZoneCount = 0;
	}

	ngOnInit(): void {
		this.admin.getShippingZoneCount().toPromise().then(count => {
			this.shippingZoneCount = count;
		});
		this.fetchShippingZones();
	}

	get shownZones(): ShippingZone[] {
		const index = this.shippingZonePageEvent.pageIndex;
		const size = this.shippingZonePageEvent.pageSize;
		return this.shippingZones.slice(index * size, index * size + size);
	}

	fetchShippingZones(event?: PageEvent): void {
		if (event) {
			this.shippingZonePageEvent = event;
			if (event.pageIndex * event.pageSize < this.shippingZones.length) {
				return;
			}
		}
		this.loaded = false;
		this.admin.getAllShippingZones(this.shippingZonePageEvent.pageIndex, this.shippingZonePageEvent.pageSize).toPromise().then(zones => {
			this.shippingZones = this.shippingZones.concat(zones);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	addNewShippingZone(): void {
		this.admin.submitShippingZone({}).toPromise().then(shippingZone => {
			this.router.navigate(['/admin/shipping-zones', shippingZone.id]);
		});
	}

}
