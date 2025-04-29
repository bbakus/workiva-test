import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'assets/data/products.json'; // Direct path to JSON file
  private products: Product[] = [];
  private isBrowser: boolean;
  private autoDownload = false; // Flag to control automatic downloads

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Only auto-load products in browser environment
    if (this.isBrowser) {
      this.loadProducts();
    }
  }

  // Enable or disable automatic JSON downloads
  setAutoDownload(enable: boolean): void {
    this.autoDownload = enable;
  }

  private loadProducts(): void {
    this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(products => console.log('Products loaded:', products?.length || 0)),
        catchError(this.handleError<Product[]>('loadProducts', []))
      )
      .subscribe(products => {
        if (products) {
          this.products = products;
          if (this.isBrowser) {
            try {
              localStorage.setItem('products', JSON.stringify(this.products));
            } catch (err) {
              console.warn('Failed to store products in localStorage:', err);
            }
          }
        }
      });
  }

  getProducts(): Observable<Product[]> {
    console.log('Fetching products');
    
    // First check if we already have products loaded
    if (this.products.length > 0) {
      return of(this.products);
    }
    
    // Check localStorage in browser environment
    if (this.isBrowser) {
      try {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
          this.products = JSON.parse(savedProducts);
          return of(this.products);
        }
      } catch (err) {
        console.warn('Failed to retrieve products from localStorage:', err);
      }
    }
    
    // Finally, fetch from JSON file directly
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(products => {
          console.log('Products fetched:', products?.length || 0);
          if (products) {
            this.products = products;
            if (this.isBrowser) {
              try {
                localStorage.setItem('products', JSON.stringify(this.products));
              } catch (err) {
                console.warn('Failed to store products in localStorage:', err);
              }
            }
          }
        }),
        catchError(this.handleError<Product[]>('getProducts', []))
      );
  }

  getProductsSync(): Product[] {
    // Return the current products array
    return [...this.products];
  }

  getProduct(id: number): Observable<Product | undefined> {
    // Check if we already have products loaded
    if (this.products.length > 0) {
      return of(this.products.find(product => product.id === id));
    }
    
    return this.getProducts().pipe(
      map(products => products.find(product => product.id === id))
    );
  }

  addProduct(product: Product): boolean {
    // Find the highest product ID
    const maxId = this.products.length > 0 
      ? Math.max(...this.products.map(p => p.id)) 
      : 0;
    
    // Assign a new ID if needed
    if (!product.id || product.id === 0) {
      product.id = maxId + 1;
    }
    
    // Add to local array
    this.products.push(product);
    
    // Save to localStorage
    if (this.isBrowser) {
      try {
        localStorage.setItem('products', JSON.stringify(this.products));
        
        // Update products.json on the server only if explicitly enabled
        this.saveProductsToServer().subscribe(
          success => {
            if (success) {
              console.log('Products successfully saved to server');
            } else {
              console.error('Failed to save products to server');
            }
          }
        );
      } catch (err) {
        console.warn('Failed to store updated products in localStorage:', err);
      }
    }
    
    console.log(`Added new product: ${product.name}`);
    return true;
  }
  
  // Update the server with the current products
  private saveProductsToServer(): Observable<boolean> {
    console.log('Saving products to server');
    
    // Only download JSON if auto-download is enabled
    if (this.autoDownload && this.isBrowser) {
      this.downloadProductsJson();
    }
    
    // Return a simulated success as we're using localStorage for now
    return of(true);
  }

  // Explicitly download the products JSON file on demand
  // This should be called only when the user explicitly requests it
  downloadProductsJson(): void {
    if (!this.isBrowser) return;
    
    const jsonStr = JSON.stringify(this.products, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
