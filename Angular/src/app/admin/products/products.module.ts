import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MediaBrowserModule } from 'src/app/media-browser/media-browser.module';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
	declarations: [
		ProductsComponent,
		ProductComponent
	],
	imports: [
		CommonModule,
		ProductsRoutingModule,
		ReactiveFormsModule,

		MediaBrowserModule,

		MatPaginatorModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatInputModule,
		MatFormFieldModule,
		MatIconModule,

		AngularEditorModule
	]
})
export class ProductsModule { }
