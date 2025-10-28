import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Category {
  categoryID?: number;
  categoryName?: string;
  description?: string;
  status?: boolean;
  created_date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoryAPI = 'http://localhost:4000/api/category';

  //??????????????????????????????????????????????????????????????????????????
  // public currentUserSubject = new BehaviorSubject<Category | null>(null);
  //   currentUser$ = this.currentUserSubject.asObservable();
  //??????????????????????????????????????????????????????????????????????????

  constructor(private http: HttpClient) {}

  //! Get All Categories
  getAllCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryAPI);
  }

  //! Get Category By ID
  getCategoryById(categoryID: number) {
    return this.http.get<Category>(`${this.categoryAPI}/id/${categoryID}`);
  }

  //! Delete Category By ID
  deleteCategoryById(categoryID: number) {
    return this.http.delete(
      `${this.categoryAPI}/id/${encodeURIComponent(categoryID)}`
    );
  }

  //! Update Category By ID
  updateCategoryById(categoryID: any, payload: any) {
    return this.http.put(
      `${this.categoryAPI}/id/${encodeURIComponent(categoryID)}`,
      payload
    );
  }

  //! Add Category
  createCategory(payload: any) {
    return this.http.post(this.categoryAPI, payload);
  }
}
