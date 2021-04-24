import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductService } from './product.service';
import { HttpClientModule } from '@angular/common/http';
import { AllProductsComponent } from './all-products/all-products.component';
import { ProductComponent } from './product/product.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
	declarations: [
		AllProductsComponent,
  ProductComponent
	],
	imports: [
		CommonModule,
		ProductRoutingModule,

		HttpClientModule,

		MatCardModule,
		MatButtonModule
	],
	exports: [
		AllProductsComponent
	],
	providers: [
		ProductService
	]
})
export class ProductModule { }
