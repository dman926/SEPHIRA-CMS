import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/admin/servies/admin.service';
import { ShippingZone } from 'src/app/models/shipping-zone';

@Component({
	selector: 'app-shipping-zones',
	templateUrl: './shipping-zones.component.html',
	styleUrls: ['./shipping-zones.component.scss'],
})
export class ShippingZonesComponent implements OnInit {

	loaded: boolean;
	shippingZones: ShippingZone[];

	shippingZonePageEvent: PageEvent;
	
	constructor(private admin: AdminService, private router: Router) {
		this.loaded = false;
		this.shippingZones = [];
		this.shippingZonePageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
	}

	ngOnInit(): void {
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
		this.admin.getAllShippingZones(this.shippingZonePageEvent.pageIndex, this.shippingZonePageEvent.pageSize).subscribe({
			next: zones => {
				this.shippingZonePageEvent.length = zones.count;
				this.shippingZones = this.shippingZones.concat(zones.shippingZones);
				this.loaded = true;
			},
			error: err => this.loaded = true
		});
	}

	addNewShippingZone(): void {
		this.admin.submitShippingZone({}).subscribe(shippingZone => {
			this.router.navigate(['/admin/shipping-zones', shippingZone.id]);
		});
	}

}
