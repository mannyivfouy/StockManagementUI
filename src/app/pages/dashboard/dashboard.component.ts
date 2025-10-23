import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/api/user.service';
import { ProductService } from '../../services/api/product.service';
import { CategoryService } from '../../services/api/category.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  totalUser = 0;
  totalProduct = 0;
  totalCategory = 0;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.userService.getAllUsers().subscribe({
      next: (users) => (this.totalUser = users.length),
      error: (err) => console.error('Error Loading User', err),
    });
  }
}
