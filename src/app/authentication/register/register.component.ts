import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/api/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  showPassword = false;
  loading = false;
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  registerForm = new FormGroup({
    fullname: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    dateOfBirth: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  get fullname() {
    return this.registerForm.get('fullname');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get gender() {
    return this.registerForm.get('gender');
  }

  get dateOfBirth() {
    return this.registerForm.get('dateOfBirth');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  submitRegister() {
    this.serverError = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = {
      fullname: this.fullname?.value,
      username: this.username?.value,
      gender: this.gender?.value,
      dateOfBirth: this.dateOfBirth?.value, // backend expects ISO date string; adjust if needed
      email: this.email?.value,
      password: this.password?.value,
    };

    this.loading = true;
    this.userService
      .createUser(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          // success: reset form and navigate
          this.registerForm.reset();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          // handle server validation / duplicate key errors
          console.error('Register error', err);
          const message =
            err?.error?.message ?? err?.message ?? 'Registration failed';

          // example: backend sends { field: 'username', message: 'already used' }
          if (err?.error?.field && err?.error?.message) {
            const field = err.error.field;
            const msg = err.error.message;
            const control = this.registerForm.get(field);
            if (control) {
              control.setErrors({ server: msg });
            } else {
              this.serverError = msg;
            }
          } else if (err?.status === 409) {
            // conflict (e.g. duplicate username/email)
            this.serverError = message;
            // map to username/email if you can parse which one:
            if (message.toLowerCase().includes('username')) {
              this.registerForm.get('username')?.setErrors({ server: message });
            } else if (message.toLowerCase().includes('email')) {
              this.registerForm.get('email')?.setErrors({ server: message });
            }
          } else {
            this.serverError = message;
          }
        },
      });
  }
}
