  import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Category {
  categoryID: any;
  categoryName: string;
  description: string;
  status: boolean;
}

export interface Product {
  productID?: any;
  productImage?: string;
  productName?: string;
  price?: number;
  stock?: number;
  amount?: number;
  categoryID?: any;
  categoryName?: string;
  description?: string;
  status?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productAPI = 'http://localhost:4000/api/product';
  private categoryAPI = 'http://localhost:4000/api/category';

  constructor(private http: HttpClient) {}

  // Categories
  getAllCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryAPI);
  }

  getCategoryById(categoryID: number): Observable<Category> {
    return this.http.get<Category>(`${this.categoryAPI}/id/${categoryID}`);
  }

  // Products
  getAllProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productAPI);
  }

  getProductById(productID: number): Observable<Product> {
    return this.http.get<Product>(`${this.productAPI}/id/${productID}`);
  }

  createProduct(payload: any) {
    return this.http.post(this.productAPI, payload);
  }

  updateProductById(productID: any, payload: any) {
    return this.http.put(
      `${this.productAPI}/id/${encodeURIComponent(productID)}`,
      payload
    );
  }

  deleteProductById(productID: number | string) {
    const id = String(productID);
    return this.http.delete(`${this.productAPI}/id/${encodeURIComponent(id)}`);
  }
}
