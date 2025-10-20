import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/api/user.service';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink } from '@angular/router';

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

  private searchTerm = '';
  private debounceTimer: number | null = null;
  private debounceMs = 300;
  
  deletedUsername = '';

  private serverUrl = 'http://localhost:4000';

  constructor(private userService: UserService, private router: Router) {}

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
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil((this.filteredUsers?.length || 0) / this.pageSize)
    );
  }

  prev() {
    if (this.currentPage > 1) this.currentPage--;
  }
  next() {
    if (this.currentPage < this.totalPages) this.currentPage++;
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

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.user || [];
    return (this.user || []).filter(
      (u) =>
        (u.username || '').toLowerCase().includes(this.searchTerm) ||
        (u.fullname || '').toLowerCase().includes(this.searchTerm)
    );
  }

  avatarUrl(user: User): string {
    if (!user.imageUrl) return `${this.serverUrl}/images/avatar.png`;
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
        // Remove user from list
        const deletedUser = this.user.find((u) => u.userID === userID);
        this.user = this.user.filter((u) => u.userID !== userID);
        
        this.deletedUsername = deletedUser?.username || '';        
      },
      error: (err) => alert(err?.error?.message || 'Delete failed'),
    });
  }

  confirmAndEdit(userID?: any) {
    if (!userID) return;

    // const ok = confirm('Open Editor For This User?');
    // if (!ok) return;

    this.router.navigate(['/user', 'editUser', userID]).catch((err) => {
      console.log('Navigate Error', err);
    });
  }
}
