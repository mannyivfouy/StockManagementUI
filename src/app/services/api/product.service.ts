import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Product {
  productID?: string;
  productImage: string;
  productName: string;
  price: number;
  category: string;
  description: string;
  stock: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productAPI = 'http://localhost:4000/api/product';

  constructor(private http: HttpClient) {}

  getAllProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productAPI);
  }

  
}
