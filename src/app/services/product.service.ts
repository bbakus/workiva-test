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



  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    console.log('Fetching products from:', this.productsUrl);
    
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(products => console.log('Products fetched:', products)),
        catchError(this.handleError<Product[]>('getProducts'))
      );
  }

  getProduct(id: number): Observable<Product | undefined> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        catchError(this.handleError<Product[]>('getProduct')),
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
