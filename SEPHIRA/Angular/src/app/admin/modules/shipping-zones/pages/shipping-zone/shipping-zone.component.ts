import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/admin/servies/admin.service';
import { ShippingZone } from 'src/app/models/shipping-zone';

interface Rate {
	rate: number;
	type: string;
	minCutoff?: number;
	maxCutoff?: number;
}

@Component({
	selector: 'sephira-shipping-zone',
	templateUrl: './shipping-zone.component.html',
	styleUrls: ['./shipping-zone.component.scss'],
})
export class ShippingZoneComponent implements OnInit {

	loaded: boolean;
	saved: boolean;

	shippingZoneGroup: FormGroup;

	private id: string | null;

	constructor(private admin: AdminService, private route: ActivatedRoute) {
		this.loaded = false;
		this.saved = false;
		this.shippingZoneGroup = new FormGroup({
			applicableStates: new FormArray([]),
			rates: new FormArray([]),
			default: new FormControl('')
		});
		this.id = null;
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.id = params.get('id');
			if (this.id) {
				this.admin.getShippingZone(this.id).subscribe(zone => {
					this.shippingZoneGroup.patchValue({
						default: zone.default
					});
					this.shippingZoneGroup.setControl('applicableStates', new FormArray(zone.applicableStates!.map(state => new FormControl(state, [Validators.required]))))
					this.shippingZoneGroup.setControl('rates', new FormArray(zone.rates!.map(rate => new FormGroup({
						rate: new FormControl(rate.rate, [Validators.required]),
						type: new FormControl(rate.type, [Validators.required]),
						minCutoff: new FormControl(rate.minCutoff ? rate.minCutoff : ''),
						maxCutoff: new FormControl(rate.maxCutoff ? rate.maxCutoff : '')
					}))));
					this.loaded = true;
				});
			}
		});
	}

	addState(): void {
		this.stateArray.push(new FormControl('', [Validators.required]))
	}

	removeState(): void {
		this.stateArray.removeAt(this.stateArray.length - 1);
	}

	addRate(): void {
		this.rateArray.push(new FormGroup({
			rate: new FormControl('', [Validators.required]),
			type: new FormControl('', [Validators.required]),
			minCutoff: new FormControl(''),
			maxCutoff: new FormControl('')
		}));
	}

	removeRate(): void {
		this.rateArray.removeAt(this.rateArray.length - 1);
	}

	editZone(): void {
		if (this.shippingZoneGroup.valid && this.id) {
			const zone: ShippingZone = {
				id: this.id,
				applicableStates: this.shippingZoneGroup.get('applicableStates')!.value,
				rates: this.shippingZoneGroup.get('rates')!.value.map((rate: any) => {
					const newRate: Rate = {
						rate: rate.rate,
						type: rate.type
					};
					if (rate.minCutoff) {
						newRate.minCutoff = rate.minCutoff;
					}
					if (rate.minCutoff) {
						newRate.maxCutoff = rate.maxCutoff;
					}
					return newRate;
				}),
				default: this.shippingZoneGroup.get('default')!.value
			};
			this.admin.editShippingZone(zone).subscribe(res => {
				this.saved = true;
				setTimeout(() => this.saved = false, 3000);
			});
		}
	}

	get stateArray(): FormArray {
		return this.shippingZoneGroup.get('applicableStates')! as FormArray;
	}

	get rateArray(): FormArray {
		return this.shippingZoneGroup.get('rates')! as FormArray;
	}

}
