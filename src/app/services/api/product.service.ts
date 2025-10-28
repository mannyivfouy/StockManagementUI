import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Category } from './category.service';

export interface Product {
  productID?: number;
  productImage?: string;
  productName?: string;
  price?: number;
  stock?: number;  
  amount?: number;
  categoryID?: number;
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

  //! Get All Categories
  getAllCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryAPI);
  }

  //! Get Category By ID
  getCategoryById(categoryID: number) {
    return this.http.get<Category>(`${this.categoryAPI}/id/${categoryID}`);
  }

  //! Get All Products
  getAllProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productAPI);
  }

  //! Get Product By ID
  getProductById(productID: number) {
    return this.http.get<Product>(`${this.productAPI}/id/${productID}`);
  }

  //! Delete Product By ID
  deleteProductById(productID: number) {
    return this.http.delete(
      `${this.productAPI}/id/${encodeURIComponent(productID)}`
    );
  }

  //! Update Product By ID
  updateProductById(productID: any, payload: any) {
    return this.http.put(
      `${this.productAPI}/id/${encodeURIComponent(productID)}`,
      payload
    );
  }

  //! Add Product
  createProduct(payload: any) {
    return this.http.post(this.productAPI, payload);
  }
}
