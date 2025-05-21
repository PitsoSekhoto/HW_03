import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'products', 
    loadComponent: () => import('./components/product-listing/product-listing/product-listing.component').then(m => m.ProductListingComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'add-product', 
    loadComponent: () => import('./components/add-product/add-product.component').then(m => m.AddProductComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/product-dashboard/product-dashboard.component').then(m => m.ProductDashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
