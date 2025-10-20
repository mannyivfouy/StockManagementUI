import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService, User } from '../../../services/api/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  showPassword = false;
  userForm!: FormGroup;
  isEdit = false;
  userID: string | null = null;
  loading = false;
  error = '';

  private serverUrl = 'http://localhost:4000';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      avatar: [''],
      userRole: ['', Validators.required],
    });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) return of(null);
          this.isEdit = true;
          this.userID = id;
          this.loading = true;
          return this.userService.getUserById(id);
        })
      )
      .subscribe({
        next: (user: User | null) => {
          this.loading = false;
          if (user) this.patchForm(user);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to load user';
        },
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get fullname() {
    return this.userForm.get('fullname');
  }
  get username() {
    return this.userForm.get('username');
  }
  get gender() {
    return this.userForm.get('gender');
  }
  get dateOfBirth() {
    return this.userForm.get('dateOfBirth');
  }
  get email() {
    return this.userForm.get('email');
  }
  get password() {
    return this.userForm.get('password');
  }
  get avatar() {
    return this.userForm.get('avatar');
  }
  get userRole() {
    return this.userForm.get('userRole');
  }

  patchForm(user: User) {
    this.userForm.patchValue({
      fullname: user.fullname ?? '',
      username: user.username ?? '',
      gender: user.gender ?? '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : null,
      email: user.email ?? '',
      avatar: user.imageUrl ?? '',
      userRole: user.role ?? 'user',
    });
  }

  imagePreview: string | null = null;

  onAvatarFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Optional: preview before upload
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    this.userService.uploadAvatar(file).subscribe((url) => {
      this.avatar?.setValue(url); // store the server URL, e.g. /images/12345.png
    });
  }

  onCancel() {
    this.router.navigate(['/user']);
  }

  submitUserForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload : any = {
      fullname: this.userForm.value.fullname,
      username: this.userForm.value.username,
      gender: this.userForm.value.gender,
      dateOfBirth: this.userForm.value.dateOfBirth,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      imageUrl: this.avatar?.value,
      role: this.userForm.value.userRole,
    };

    if (this.isEdit && this.userID) {
      payload.userID = Number(this.userID); 
      this.userService.updateUserById(this.userID, payload).subscribe({
        next: () => {
          alert('User updated');
          this.router.navigate(['/user']);
        },
        error: (err) => alert(err?.error?.message || 'Update failed'),
      });
    } else {
      this.userService.createUser(payload).subscribe({
        next: () => {
          alert('User created');
          this.router.navigate(['/user']);
        },
        error: (err) => alert(err?.error?.message || 'Create failed'),
      });
    }
  }
}
