import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-shipping-zone',
	templateUrl: './shipping-zone.component.html',
	styleUrls: ['./shipping-zone.component.scss']
})
export class ShippingZoneComponent implements OnInit {

	loaded: boolean;
	saved: boolean;

	shippingZoneGroup: FormGroup;

	private subs: Subscription[];

	constructor(private admin: AdminService, private route: ActivatedRoute) {
		this.loaded = false;
		this.saved = false;
		this.shippingZoneGroup = new FormGroup({

		});
		this.subs = [];
	}

	ngOnInit(): void {
		this.subs.push(this.route.paramMap.subscribe(params => {
			const id = params.get('id');
			if (id) {
				this.admin.getShippingZone(id).toPromise().then(zone => {
					this.shippingZoneGroup.patchValue({

					});
					this.loaded = true;
				});
			}
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	editZone(): void {
		if (this.shippingZoneGroup.valid) {
			const zone: ShippingZone = {

			};
			this.admin.editShippingZone(zone).toPromise().then(res => {
				this.saved = true;
				setTimeout(() => this.saved = false, 3000);
			});
		}
	}

}
