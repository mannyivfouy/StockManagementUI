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

  selectedAvatarFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // create form: password and avatar are optional here; we'll require password only on create
    this.userForm = this.fb.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // optional for edit
      avatar: [''], // this control will store image URL (string), not the file input
      userRole: ['', Validators.required],
    });

    // Load user for edit mode
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
          console.error('Get user failed', err);
        },
      });

    // If not in edit mode (create) require password
    // (if route param has no id, isEdit remains false)
    if (!this.isEdit) {
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    } 
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // getters for template convenience
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
  } // stores image URL after upload
  get userRole() {
    return this.userForm.get('userRole');
  }

  patchForm(user: User) {
    // patch only non-file fields
    this.userForm.patchValue({
      fullname: user.fullname ?? '',
      username: user.username ?? '',
      gender: user.gender ?? '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : null,
      email: user.email ?? '',
      userRole: user.role ?? 'user',
      avatar: user.imageUrl ?? '', // safe: a string URL
    });

    // show preview of existing image (do NOT try to set file input)
    this.imagePreview = user.imageUrl ?? null;

    // For edit: password remains optional (user enters new password only if they want to change)
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // file input NOT bound to formControl; store file here and upload to server
  onAvatarFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedAvatarFile = file;

    // preview locally
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);

    // upload file to server (assumes userService.uploadAvatar returns observable<string> url)
    this.userService.uploadAvatar(file).subscribe({
      next: (url: string) => {
        console.log('avatar uploaded ->', url);
        // set the avatar control to the uploaded URL (a string)
        this.userForm.patchValue({ avatar: url });
      },
      error: (err) => {
        console.error('avatar upload failed', err);
      },
    });
  }

  onCancel() {
    this.router.navigate(['/user']);
  }

  submitUserForm() {
    // If form invalid, show validation
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Build payload with only actual fields (avoid sending empty password/avatar)
    const payload: any = {
      fullname: this.userForm.value.fullname,
      username: this.userForm.value.username,
      gender: this.userForm.value.gender,
      dateOfBirth: this.userForm.value.dateOfBirth,
      email: this.userForm.value.email,
      role: this.userForm.value.userRole,
    };

    if (this.userForm.value.password) {
      payload.password = this.userForm.value.password;
    }

    // avatar control contains URL string only if upload occurred or existing URL present
    if (this.userForm.value.avatar) {
      payload.imageUrl = this.userForm.value.avatar;
    }

    console.log(
      'SUBMIT -> isEdit:',
      this.isEdit,
      'userID:',
      this.userID,
      'payload:',
      payload
    );

    if (this.isEdit && this.userID) {
      // Do NOT include userID in body; backend reads id from URL param
      this.userService.updateUserById(this.userID, payload).subscribe({
        next: (res: any) => {
          console.log('Update response:', res);
          alert('User updated');
          this.router.navigate(['/user']);
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert(err?.error?.message || 'Update failed');
        },
      });
    } else {
      // Create flow
      this.userService.createUser(payload).subscribe({
        next: (res) => {
          console.log('Create response:', res);
          alert('User created');
          this.router.navigate(['/user']);
        },
        error: (err) => {
          console.error('Create failed:', err);
          alert(err?.error?.message || 'Create failed');
        },
      });
    }
  }
}
