import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/api/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  user: User[] = [];
  loading = true;
  error = '';

  pageSize = 10;
  currentPage = 1;

  private serverUrl = 'http://localhost:4000';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed To Fetch User';
        this.loading = false;
      },
    });
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return (this.user || []).slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.user?.length || 0) / this.pageSize));
  }

  prev() {
    if (this.currentPage > 1) this.currentPage--;
  }
  next() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  avatarUrl(user: User): string {
    if (!user.imageUrl) return `${this.serverUrl}/images/default_img.png`;
    if (user.imageUrl.startsWith('http')) return user.imageUrl;
    return `${this.serverUrl}${user.imageUrl.startsWith('/') ? '' : '/'}${
      user.imageUrl
    }`;
  }

  confirmAndDelete(userID?: any): void {
    if (!userID) {
      console.warn('User ID missing, cannot delete');
      return;
    }

    if (!confirm(`Delete this user? This cannot be undone.`)) return;

    this.userService.deleteUserById(userID).subscribe({
      next: () => {
        this.user = this.user.filter((u) => u.userID !== userID); // note user.userID
      },
      error: (err) => alert(err?.error?.message || 'Delete failed'),
    });
  }

  confirmAndEdit(username?: string): void {}
}
