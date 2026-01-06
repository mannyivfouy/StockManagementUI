// store.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  productID: number;
  productName: string;
  price: number;
  productImage?: string;
  categoryID: number;
  categoryName?: string;
  stock: number;
  description: string;
  status: boolean;
}

export interface Category {
  categoryID: number;
  categoryName: string;
  description: string;
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private API = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/product`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API}/category`);
  }

  createPurchase(payload: any): Observable<any> {
    return this.http.post(`${this.API}/purchase`, payload)
  }
}
