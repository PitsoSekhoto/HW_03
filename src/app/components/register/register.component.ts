import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    console.log('RegisterComponent initialized');
  }

  onSubmit(): void {
    console.log('Form submitted');
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form values:', this.registerForm.value);
    
    if (this.registerForm.valid) {
      console.log('=== REGISTRATION ATTEMPT ===');
      console.log('Email:', this.registerForm.value.email);
      console.log('Password length:', this.registerForm.value.password.length);
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('=== REGISTRATION SUCCESS ===');
          console.log('Response:', response);
          this.snackBar.open('Registered successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('=== REGISTRATION ERROR ===');
          console.error('Error object:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
          
          let errorMessage = 'Registration failed';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage = 'Unable to connect to the server. Please check if the server is running.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid registration data. Please check your input.';
          } else if (error.status === 409) {
            errorMessage = 'Email already exists. Please use a different email.';
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      console.log('=== FORM VALIDATION ERRORS ===');
      console.log('Email errors:', this.registerForm.get('email')?.errors);
      console.log('Password errors:', this.registerForm.get('password')?.errors);
    }
  }
}