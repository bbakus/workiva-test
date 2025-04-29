import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  checkoutSuccess = false;
  checkoutInProgress = false;
  showBillingModal = false;
  
  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  get total(): number {
    return this.cartService.getCartTotal();
  }

  removeItem(id: number): void {
    this.cartService.removeFromCart(id);
  }

  updateQuantity(id: number, quantity: number): void {
    this.cartService.updateQuantity(id, quantity);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  // Show billing modal
  openBillingModal(): void {
    this.showBillingModal = true;
  }

  // Close billing modal
  closeBillingModal(): void {
    this.showBillingModal = false;
  }

  // Process checkout when "Pay Now" is clicked in the modal
  checkout(): void {
    this.checkoutInProgress = true;
    this.showBillingModal = false;
    
    this.cartService.checkout().subscribe({
      next: (success) => {
        if (success) {
          this.checkoutSuccess = true;
          this.checkoutInProgress = false;
          
          // Redirect to products page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/products']);
            this.checkoutSuccess = false;
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.checkoutInProgress = false;
        alert('Payment processing failed. Please try again later.');
      }
    });
  }

  goToProductList(): void {
    this.router.navigate(['/products']);
  }
} 