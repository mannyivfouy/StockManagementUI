import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

export interface User {
  userID?: string;
  fullname?: string;
  username?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
  created_date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userAPI = 'http://localhost:4000/api/user';

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userAPI);
  }

  getUserByUsername(username: string) {
    return this.http.get<User>(
      `${this.userAPI}/${encodeURIComponent(username)}`
    );
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.userAPI}/id/${id}`);
  }

  deleteUserByUsername(username: string) {
    return this.http.delete(`${this.userAPI}/${encodeURIComponent(username)}`);
  }

  deleteUserById(userID: string) {
    return this.http.delete(`${this.userAPI}/id/${encodeURIComponent(userID)}`);
  }

  createUser(payload: any) {
    return this.http.post(`${this.userAPI}`, payload);
  }

  updateUserById(userID: any, payload: any) {
    return this.http.put(
      `${this.userAPI}/id/${encodeURIComponent(userID)}`,
      payload
    );
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http
      .post<{ url: string }>(`${this.userAPI}/upload-avatar`, formData)
      .pipe(map((res) => res.url));
  }

  // login(payload: { username: string; password: string }): Observable<any> {
  //   return this.http
  //     .post<{ token: string; user: User }>(`${this.userAPI}/login`, payload)
  //     .pipe(
  //       tap((res) => {
  //         // update BehaviorSubject if token+user returned
  //         if (res?.user) {
  //           this.currentUserSubject.next(res.user);
  //         }
  //       })
  //     );
  // }

  login(payload: { username: string; password: string }) {
    return this.http
      .post<{ token: string; user: User }>(`${this.userAPI}/login`, payload)
      .pipe(
        tap((res) => {
          if (res?.token) {
            // persist to localStorage for simple auth (beginner-friendly)
            localStorage.setItem('auth_token', res.token);
          }
          if (res?.user) {
            // keep current user in memory and storage
            this.currentUserSubject.next(res.user);
            localStorage.setItem('current_user', JSON.stringify(res.user));
            localStorage.setItem('isLoggedIn', 'true');
          }
        })
      );
  }
}
