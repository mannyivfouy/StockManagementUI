import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  Category,
  CategoryService,
} from '../../../services/api/category.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  category: Category[] = [];
  loading = true;
  error = '';

  pageSize = 10;
  currentPage = 1;

  private searchTerm = '';
  private debounceTimer: number | null = null;
  private debounceMs = 300;

  deleteCategoryName = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategory();
  }

  loadCategory() {
    this.loading = true;
    this.categoryService.getAllCategory().subscribe({
      next: (data) => {
        this.category = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Falied To Fetch Category';
        this.loading = false;
      },
    });
  }

  get pagedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories.slice(start, start + this.pageSize);
  }

  get totalPage(): number {
    return Math.max(
      1,
      Math.ceil((this.filteredCategories?.length || 0) / this.pageSize)
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

  get filteredCategories(): Category[] {
    if (!this.searchTerm) return this.category || [];
    return (this.category || []).filter((c) =>
      (c.categoryName || '').toLowerCase().includes(this.searchTerm)
    );
  }

  confirmAndDelete(categoryID?: any): void {
    if (!categoryID) {
      console.warn('Category ID Missing, Cannot Delete');
      return;
    }

    if (!confirm(`Delete This Category? This Cannot Be Undone.`)) return;

    this.categoryService.deleteCategoryById(categoryID).subscribe({
      next: () => {
        const deletedCategory = this.category.find(
          (c) => c.categoryID === categoryID
        );
        this.category = this.category.filter(
          (c) => c.categoryID !== categoryID
        );

        this.deleteCategoryName = deletedCategory?.categoryName || '';
      },
      error: (err) => alert(err?.error?.message || 'Delete Failed'),
    });
  }

  confirmAndEdit(categoryID?: any) {
    if (!categoryID) return;

    this.router
      .navigate(['/category', 'editCategory', categoryID])
      .catch((err) => {
        console.log('Navigate Error', err);
      });
  }
}
