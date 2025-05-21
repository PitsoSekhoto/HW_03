import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  imagePath: string;
  brandName: string;
  productTypeName: string;
  productBrand: string;
  productType: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/store`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  addProduct(productData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/product`, productData);
  }

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/brands`);
  }

  getProductTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/product-types`);
  }

  getDashboardData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }
}