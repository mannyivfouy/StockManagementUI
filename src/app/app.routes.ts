import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { UserFormComponent } from './pages/user/user-form/user-form.component';
import { ProductListComponent } from './pages/product/product-list/product-list.component';
import { ProductFormComponent } from './pages/product/product-form/product-form.component';
import { CategoryListComponent } from './pages/category/category-list/category-list.component';
import { CategoryFormComponent } from './pages/category/category-form/category-form.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'user',
        children: [
          {
            path: '',
            component: UserListComponent,
            data: { title: 'Users' },
          },
          {
            path: 'createUser',
            component: UserFormComponent,
            data: { title: 'User Form' },
          },
          {
            path: 'editUser/:id',
            component: UserFormComponent,
            data: { title: 'User Form' },
          },
        ],
      },
      {
        path: 'product',
        children: [
          {
            path: '',
            component: ProductListComponent,
            data: { title: 'Products' },
          },
          {
            path: 'createProduct',
            component: ProductFormComponent,
            data: { title: 'Product Form' },
          },
          {
            path: 'editProduct/:id',
            component: ProductFormComponent,
            data: { title: 'Product Form' },
          },
        ],
      },
      {
        path: 'category',
        children: [
          {
            path: '',
            component: CategoryListComponent,
            data: { title: 'Categories' },
          },
          {
            path: 'createCategory',
            component: CategoryFormComponent,
            data: { title: 'Category Form' },
          },
          {
            path: 'editCategory/:id',
            component: CategoryFormComponent,
            data: { title: 'Category Form' },
          },
        ],
      },
    ],
  },
];
