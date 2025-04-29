import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'assets/data/products.json';

  // Fallback data in case JSON loading fails
  private fallbackProducts: Product[] = [
    {
      id: 1,
      name: "Smartphone X",
      price: 899.99,
      description: "The latest smartphone with advanced camera features and all-day battery life.",
      imageUrl: "https://via.placeholder.com/150"
    },
    {
      id: 2,
      name: "Laptop Pro",
      price: 1299.99,
      description: "Ultra-thin laptop with powerful performance and stunning display.",
      imageUrl: "https://via.placeholder.com/150"
    },
    {
      id: 3,
      name: "Wireless Headphones",
      price: 199.99,
      description: "Premium sound quality with noise cancellation technology.",
      imageUrl: "https://via.placeholder.com/150"
    },
    {
      id: 4,
      name: "Smart Watch",
      price: 249.99,
      description: "Track your fitness and stay connected with this stylish smart watch.",
      imageUrl: "https://via.placeholder.com/150"
    },
    {
      id: 5,
      name: "Tablet Mini",
      price: 349.99,
      description: "Portable tablet with vibrant display and long battery life.",
      imageUrl: "https://via.placeholder.com/150"
    }
  ];

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    console.log('Fetching products from:', this.productsUrl);
    
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(products => console.log('Products fetched:', products)),
        catchError(this.handleError<Product[]>('getProducts', this.fallbackProducts))
      );
  }

  getProduct(id: number): Observable<Product | undefined> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        catchError(this.handleError<Product[]>('getProduct', this.fallbackProducts)),
        map((products: Product[]) => products.find(product => product.id === id))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      console.log(`Using fallback data for ${operation}`);
      // Let the app keep running by returning an empty result or fallback data
      return of(result as T);
    };
  }
}
