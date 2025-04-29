import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private isBrowser: boolean;
  
  cart$ = this.cartSubject.asObservable();
  
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private productService: ProductService
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Check for cart in localStorage only in browser environment
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next(this.cartItems);
      }
    }
  }
  
  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem = new CartItem(
        product.id,
        product.name,
        product.price,
        product.imageUrl || 'assets/images/placeholder.jpg'
      );
      this.cartItems.push(newItem);
    }
    
    this.updateCart();
  }
  
  removeFromCart(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.updateCart();
  }
  
  updateQuantity(itemId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        this.updateCart();
      }
    }
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  getCartCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }
  
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  checkout(): Observable<boolean> {
    return new Observable(observer => {
      try {
        // Add purchased items to the products collection as "bought" cards
        const itemsToAdd = this.cartItems.map(item => ({
          id: 0, // Will be assigned by the product service
          name: `${item.name} (Bought)`,
          price: item.price,
          description: `Previously purchased card: ${item.name}`,
          imageUrl: item.imageUrl
        }));
        
        // Add each item to the product collection
        itemsToAdd.forEach(item => {
          this.productService.addProduct(item);
        });
        
        // Clear the cart after successful checkout
        this.clearCart();
        
        // Return success
        observer.next(true);
        observer.complete();
      } catch (error) {
        console.error('Error during checkout:', error);
        observer.next(false);
        observer.complete();
      }
    });
  }
  
  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    
    // Save to localStorage only in browser environment
    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }
} 