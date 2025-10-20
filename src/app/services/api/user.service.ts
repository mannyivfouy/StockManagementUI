import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject} from 'rxjs';
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
  private apiUrl = 'http://localhost:4000/api/user';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserByUsername(username: string) {
    return this.http.get<User>(
      `${this.apiUrl}/${encodeURIComponent(username)}`
    );
  }

  getUserById(id: string) {
    return this.http.get<User>(`${this.apiUrl}/id/${id}`);
  }

  deleteUserByUsername(username: string) {
    return this.http.delete(`${this.apiUrl}/${encodeURIComponent(username)}`);
  }

  deleteUserById(userID: string) {
    return this.http.delete(`${this.apiUrl}/id/${encodeURIComponent(userID)}`);
  }

  createUser(payload: any) {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  updateUserById(userID: any, payload: any) {
    return this.http.put(
      `${this.apiUrl}/id/${encodeURIComponent(userID)}`,
      payload
    );
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http
      .post<{ url: string }>(`${this.apiUrl}/upload-avatar`, formData)
      .pipe(map((res) => res.url));
  }
}