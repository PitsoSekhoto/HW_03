import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

import { ProductService } from '../../services/product.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-product-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    CurrencyPipe
  ],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.css'
})
export class ProductDashboardComponent implements OnInit {
  displayedColumns: string[] = ['name', 'price', 'brand', 'type', 'description'];
  topProducts: any[] = [];
  brandChart: any;
  typeChart: any;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.productService.getDashboardData().subscribe({
      next: (data) => {
        this.topProducts = data.topProducts;
        this.createBrandChart(data.brandCounts);
        this.createTypeChart(data.typeCounts);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  createBrandChart(brandCounts: any[]): void {
    const labels = brandCounts.map(item => item.brand);
    const data = brandCounts.map(item => item.count);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];

    const canvas = document.getElementById('brandChart') as HTMLCanvasElement;
    if (canvas) {
      if (this.brandChart) {
        this.brandChart.destroy();
      }
      
      this.brandChart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, data.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  createTypeChart(typeCounts: any[]): void {
    const labels = typeCounts.map(item => item.type);
    const data = typeCounts.map(item => item.count);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];

    const canvas = document.getElementById('typeChart') as HTMLCanvasElement;
    if (canvas) {
      if (this.typeChart) {
        this.typeChart.destroy();
      }
      
      this.typeChart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, data.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }
}