import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShopRoutingModule } from './shop-routing.module';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { StarRatingModule } from '../star-rating/star-rating.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchModule } from '../search/search.module';


@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent
  ],
  imports: [
    CommonModule,
    ShopRoutingModule,
	ReactiveFormsModule,

	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatButtonModule,
	MatCardModule,
	MatTabsModule,
	MatFormFieldModule,
	MatInputModule,

	StarRatingModule,
	SearchModule
  ]
})
export class ShopModule { }
