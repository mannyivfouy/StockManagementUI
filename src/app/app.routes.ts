import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { UserFormComponent } from './pages/user/user-form/user-form.component';
import { ProductListComponent } from './pages/product/product-list/product-list.component';
import { ProductFormComponent } from './pages/product/product-form/product-form.component';
import { CategoryListComponent } from './pages/category/category-list/category-list.component';
import { CategoryFormComponent } from './pages/category/category-form/category-form.component';
import { ReportComponent } from './pages/report/report.component';
import { StoreComponent } from './store/store.component';
import { AuthGuard } from './guards/auth.guard';

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
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', role: 'admin' },
      },
      {
        path: 'user',
        children: [
          {
            path: '',
            component: UserListComponent,
            data: { title: 'Users', role: 'admin' },
          },
          {
            path: 'createUser',
            component: UserFormComponent,
            data: { title: 'User Form', role: 'admin' },
          },
          {
            path: 'editUser/:id',
            component: UserFormComponent,
            data: { title: 'User Form', role: 'admin' },
          },
        ],
      },
      {
        path: 'product',
        children: [
          {
            path: '',
            component: ProductListComponent,
            data: { title: 'Products', role: 'admin' },
          },
          {
            path: 'createProduct',
            component: ProductFormComponent,
            data: { title: 'Product Form', role: 'admin' },
          },
          {
            path: 'editProduct/:id',
            component: ProductFormComponent,
            data: { title: 'Product Form', role: 'admin' },
          },
        ],
      },
      {
        path: 'category',
        children: [
          {
            path: '',
            component: CategoryListComponent,
            data: { title: 'Categories', role: 'admin' },
          },
          {
            path: 'createCategory',
            component: CategoryFormComponent,
            data: { title: 'Category Form', role: 'admin' },
          },
          {
            path: 'editCategory/:id',
            component: CategoryFormComponent,
            data: { title: 'Category Form', role: 'admin' },
          },
        ],
      },
      {
        path: 'report',
        component: ReportComponent,
        data: { title: 'Reports', role: 'admin' },
      },
    ],
  },
  {
    path: 'store',
    component: StoreComponent,
    canActivate: [AuthGuard],
  },
];
