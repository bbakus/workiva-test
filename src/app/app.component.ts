import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-shop';
  cartItemCount = 0;
  
  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {}
  
  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItemCount = this.cartService.getCartCount();
    });
  }
  
  downloadProductsJson(): void {
    this.productService.downloadProductsJson();
  }
}
