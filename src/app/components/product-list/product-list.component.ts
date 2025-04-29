import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {
    console.log('ProductListComponent constructed');
  }

  ngOnInit(): void {
    console.log('ProductListComponent initialized');
    this.getProducts();
  }

  getProducts(): void {
    console.log('Getting products from service');
    this.productService.getProducts()
      .subscribe({
        next: (products) => {
          console.log('Products received in component:', products);
          this.products = products;
          this.loading = false;
          
          // Debugging
          if (!products || products.length === 0) {
            console.warn('No products received from service');
          }
        },
        error: (err) => {
          console.error('Failed to load products', err);
          this.errorMessage = err.message || 'Unknown error occurred';
          this.loading = false;
          this.error = true;
        }
      });
  }

  onProductSelected(product: Product): void {
    console.log('Product selected:', product);
    this.router.navigate(['/products', product.id]);
  }
}
