import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

import { ProductService } from '../../../services/product.service';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imagePath: string;
  brandName: string;
  productTypeName: string;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
   
  ],
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.css'
})
export class ProductListingComponent implements OnInit {
  displayedColumns: string[] = ['image', 'name', 'price', 'description', 'brandName', 'productTypeName'];
  dataSource = new MatTableDataSource<Product>([]);
  filterValue = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.name.toLowerCase().includes(searchStr) ||
             data.price.toString().includes(searchStr) ||
             data.description.toLowerCase().includes(searchStr) ||
             data.brandName.toLowerCase().includes(searchStr) ||
             data.productTypeName.toLowerCase().includes(searchStr);
    };
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => { console.log('API response products:', products);
      console.log('Sample image path:', products[0]?.imagePath);
        this.dataSource.data = products;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatPrice(price: number): string {
    return `R ${price.toFixed(2)}`;
  }
  
  // Method to handle different image data formats
  getImageUrl(imageData: string | null): string {
    if (!imageData) {
      return 'assets/placeholder.jpg';
    }
    
    // If it's already a data URL, return as-is
    if (imageData.startsWith('data:image')) {
      return imageData;
    }
    
    // If it's a path (starts with /), convert to full URL
    if (imageData.startsWith('/')) {
      return `http://localhost:5184${imageData}`;
    }
    
    // Otherwise assume it's a Base64 string and convert to data URL
    return `data:image/png;base64,${imageData}`;
  }
}