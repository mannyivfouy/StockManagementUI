import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';

import { UserService } from '../../services/api/user.service';
import { ProductService } from '../../services/api/product.service';
import { CategoryService } from '../../services/api/category.service';
import { ReportService } from '../../services/api/report.service';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('columnChartCanvas')
  columnChartCanvas!: ElementRef<HTMLCanvasElement>;

  totalUser = 0;
  totalProduct = 0;
  totalCategory = 0;
  totalReport = 0;

  columnChart!: Chart | null;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.loadCounts();
  }

  ngAfterViewInit() {
    // Chart is built after reports are loaded inside loadCharts()
    this.loadCharts();
  }

  ngOnDestroy() {
    if (this.columnChart) {
      this.columnChart.destroy();
      this.columnChart = null;
    }
  }

  loadCounts() {
    this.userService.getAllUsers().subscribe({
      next: (users) => (this.totalUser = users.length),
    });

    this.categoryService.getAllCategory().subscribe({
      next: (categories) => (this.totalCategory = categories.length),
    });

    this.productService.getAllProduct().subscribe({
      next: (products) => (this.totalProduct = products.length),
    });

    this.reportService.getAllReport().subscribe({
      next: (reports) => (this.totalReport = reports.length),
    });
  }

  loadCharts() {
    this.reportService.getAllReport().subscribe({
      next: (reports) => {
        if (!reports || reports.length === 0) return;

        const processed = reports.map((r: any) => {
          const raw = r.purchase_date || r.create_date || r.date || '';
          const datePart = (raw + '').split('T')[0]; // if ISO
          return { ...r, date: datePart || 'unknown' };
        });

        this.buildColumnChart(processed);
      },
      error: (err) => console.error('Error loading reports for chart', err),
    });
  }

  buildColumnChart(reports: any[]) {
    // Count reports per date
    const counts: Record<string, number> = {};
    for (const r of reports) {
      const d = r.date || 'unknown';
      counts[d] = (counts[d] || 0) + 1;
    }

    // Sort labels (dates) ascending
    const labels = Object.keys(counts).sort((a, b) =>
      a > b ? 1 : a < b ? -1 : 0
    );
    const data = labels.map((lbl) => counts[lbl]);

    // Destroy existing chart if present
    if (this.columnChart) {
      this.columnChart.destroy();
      this.columnChart = null;
    }

    this.columnChart = new Chart(this.columnChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Number of Reports',            
            data,
            backgroundColor: '#0D6EFD',
            barPercentage: 0.4,
            categoryPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Report Count',
            },
            ticks: {
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y ?? ctx.parsed}: reports`,
            },
          },
        },
      },
    });
  }
}
