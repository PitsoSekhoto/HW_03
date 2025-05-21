import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';

import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    NgIf,
    NgFor
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  brands: any[] = [];
  productTypes: any[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      description: ['', Validators.required],
      brandId: ['', Validators.required],
      productTypeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBrands();
    this.loadProductTypes();
  }

  loadBrands(): void {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  loadProductTypes(): void {
    this.productService.getProductTypes().subscribe({
      next: (productTypes) => {
        this.productTypes = productTypes;
      },
      error: (error) => {
        console.error('Error loading product types:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('brand', this.productForm.get('brandId')?.value);
      formData.append('producttype', this.productForm.get('productTypeId')?.value);
      
      if (this.selectedFile) {
        formData.append('Image', this.selectedFile);
      }
  
      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          const productName = this.productForm.get('name')?.value;
          this.snackBar.open(`${productName} created successfully`, 'Close', { duration: 3000 });
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.snackBar.open('Error creating product: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 3000 });
        }
      });
    }
  }
}