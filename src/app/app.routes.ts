import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { SellFormComponent } from './components/sell-form/sell-form.component';
import { SellResultComponent } from './components/sell-result/sell-result.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'sell', component: SellFormComponent },
  { path: 'sell/result/:id', component: SellResultComponent },
  { path: '**', redirectTo: '/products' }
];
