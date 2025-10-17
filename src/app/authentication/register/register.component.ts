import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {}

  registerForm = new FormGroup(
    {      
      fullname: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),      
    },    
  );

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
    this.registerForm.reset();
    this.router.navigate(['/dashboard']);
  }
}
