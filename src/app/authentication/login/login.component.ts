import { CommonModule } from '@angular/common';
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
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
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
    this.userService
      .login(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          console.log('Login success', res);
          localStorage.setItem('isLoggedIn', 'true');
          this.router.navigate(['/dashboard']);

          if (res?.token) {
            console.log('[login] server token:', res.token);
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem(
              'current_user',
              JSON.stringify(res.user ?? {})
            );
            localStorage.setItem('isLoggedIn', 'true'); // optional for older guard
            console.log(
              '[login] token saved to localStorage:',
              localStorage.getItem('auth_token')
            );
            // now navigate
            this.router.navigate(['/dashboard']);
          } else {
            console.error('[login] unexpected response, no token', res);
          }
        },
        error: (err) => {
          this.error = 'Invalid username or password';
          console.error(err);
        },
      });
  }
}
