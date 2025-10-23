import { Injectable } from '@angular/core';

export interface Product {
  productID? : string;
  productImage : string;
  productName : string;
  price : number;
  category : string;
  description : string;
  stock : boolean;    
}

@Injectable({
  providedIn: 'root',
})

export class ProductService {
  private productAPI = 'http://localhost:4000/api/product'
}
