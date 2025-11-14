import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../../services/api/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      username: this.username?.value as string,
      password: this.password?.value as string,
    };

    this.loading = true;
    this.error = null;

    this.userService
      .login(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          // basic validation of server response
          if (!res || !res.token || !res.user) {
            this.error = 'Invalid server response';
            console.error('[login] unexpected response', res);
            return;
          }

          localStorage.setItem('token', res.token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              userID: res.user.userID || res.user.id, // ensure ID exists
              username: res.user.username || res.user.fullname || 'Guest',
            })
          );

          // current user and token already saved by UserService.login() tap
          const role = (res.user.role || 'user').toString().toLowerCase();

          // redirect by role
          if (role === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/store']);
          }
        },
        error: (err) => {
          this.error = 'Invalid username or password';
          console.error('[login] error', err);
        },
      });
  }
}
