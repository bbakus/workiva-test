import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  loading = true;
  error = false;
  addedToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.getProduct();
  }

  getProduct(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.navigateToProductList();
      return;
    }

    this.productService.getProduct(id)
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
          if (!product) {
            // Product not found
            setTimeout(() => {
              this.navigateToProductList();
            }, 3000); // Redirect after 3 seconds
          }
        },
        error: (err) => {
          console.error('Failed to load product', err);
          this.loading = false;
          this.error = true;
        }
      });
  }

  navigateToProductList(): void {
    this.router.navigate(['/products']);
  }

  closeModal(event: MouseEvent): void {
    // Close the modal when clicking on the overlay background
    this.navigateToProductList();
  }

  stopPropagation(event: MouseEvent): void {
    // Prevent click from bubbling up to the overlay
    event.stopPropagation();
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
      this.addedToCart = true;
      
      // Reset the added to cart message after 2 seconds
      setTimeout(() => {
        this.addedToCart = false;
      }, 2000);
    }
  }
}
