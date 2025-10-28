import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product, ProductService } from '../../../services/api/product.service';
import { CommonModule } from '@angular/common';
import {
  Category,
  CategoryService,
} from '../../../services/api/category.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-product-list',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  product: Product[] = [];
  category: Category[] = [];
  selectCategoryName: string | null = null;
  loading = true;
  error = '';

  pageSize = 10;
  currentPage = 1;

  private searchTerm = '';
  private debounceTimer: number | null = null;
  private debounceMs = 300;

  deleteProductName = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
    this.loadCategory();
  }

  loadProduct() {
    this.loading = true;
    this.productService.getAllProduct().subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed To Fetch Product';
        this.loading = false;
      },
    });
  }

  loadCategory() {
    this.loading = true;
    this.categoryService.getAllCategory().subscribe({
      next: (data) => {
        this.category = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed To Fetch Category';
        this.loading = false;
      },
    });
  }

  getCategoryName(categoryID: number): string {
    const cat = this.category.find((c) => c.categoryID === categoryID);
    return cat?.categoryName ?? 'Unknown';    
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPage(): number {
    return Math.max(
      1,
      Math.ceil((this.filteredProducts?.length || 0) / this.pageSize)
    );
  }

  prev() {
    if (this.currentPage > 1) this.currentPage--;
  }

  next() {
    if (this.currentPage < this.totalPage) this.currentPage++;
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const value = input?.value ?? '';

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.searchTerm = value.trim().toLowerCase();
      this.currentPage = 1;
      this.debounceTimer = null;
    }, this.debounceMs);
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) return this.product || [];
    return (this.product || []).filter((p) =>
      (p.productName || '').toLowerCase().includes(this.searchTerm)
    );
  }

  confirmAndDelete(productID?: any): void {
    if (!productID) {
      console.warn('Product ID Missing, Cannot Delete');
      return;
    }

    if (!confirm(`Delete This Product? This Cannot Be Undone.`)) return;

    this.productService.deleteProductById(productID).subscribe({
      next: () => {
        const deleteProduct = this.product.find(
          (p) => p.productID === productID
        );
        this.product = this.product.filter((p) => p.productID !== productID);

        this.deleteProductName = deleteProduct?.productName || '';
      },
      error: (err) => alert(err?.error?.message || 'Delete Failed'),
    });
  }

  confirmAndEdit(productID?: any) {
    if (!productID) return;

    this.router
      .navigate(['/product', 'editProduct', productID])
      .catch((err) => {
        console.log('Navigate Error', err);
      });
  }
}
