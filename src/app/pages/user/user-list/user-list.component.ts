import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/api/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  user: User[] = [];
  loading = true;
  error = '';

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
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed To Fetch User';
        this.loading = false;
      },
    });
  }

  // confirmAndDelete(username: string){
  //   if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
  //   this.userService.deleteUserByUsername(username).subscribe({
  //     next: () => {
  //       // optimistic refresh
  //       this.user = this.user.filter((u) => u.username !== username);
  //     },
  //     error: (err) => alert(err.error?.message || 'Delete failed'),
  //   });
  // }

  confirmAndDelete(username?: string): void {
    if (!username) {
      // optional: show an error toast or console.warn
      console.warn('Username missing, cannot delete');
      return;
    }

    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;

    this.userService.deleteUserByUsername(username).subscribe({
      next: () =>
        (this.user = this.user.filter((u) => u.username !== username)),
      error: (err) => alert(err?.error?.message || 'Delete failed'),
    });
  }

  avatarUrl(user: User): string {
    if (!user.imageUrl) return `${this.serverUrl}/images/default_img.png`;
    if (user.imageUrl.startsWith('http')) return user.imageUrl;
    return `${this.serverUrl}${user.imageUrl.startsWith('/') ? '' : '/'}${
      user.imageUrl
    }`;
  }
}
