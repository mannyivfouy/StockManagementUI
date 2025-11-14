import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/api/report.service';
import { Report } from '../../services/api/report.service';
import { ReportItem } from '../../services/api/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  reports: Report[] = [];
  filtered: Report[] = [];
  paged: Report[] = [];
  pageSize = 6;
  currentPage = 1;
  loading = false;
  error = '';
  search = '';
  expanded = new Set<any>();

  constructor(private reportSvc: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.reportSvc.getAllReport().subscribe({
      next: (data: Report[]) => {
        this.reports = data.sort(
          (a, b) =>
            new Date(b.create_date).getTime() -
            new Date(a.create_date).getTime()
        );
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reports.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = this.search.trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.reports];
    } else {
      this.filtered = this.reports.filter(
        (r) =>
          String(r.reportID).includes(q) ||
          (r.username && r.username.toLowerCase().includes(q)) ||
          String(r.userID).includes(q) ||
          r.items.some((it) => (it.productName || '').toLowerCase().includes(q))
      );
    }
    this.currentPage = 1;
    this.updatePaged();
  }

  updatePaged(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  prev(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaged();
    }
  }

  next(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.updatePaged();
    }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  onSearch(event: any): void {
    this.search = event.target.value;
    this.applyFilter();
  }

  toggleExpand(id: any) {
    if (this.expanded.has(id)) this.expanded.delete(id);
    else this.expanded.add(id);
  }

  isExpanded(id: any) {
    return this.expanded.has(id);
  }

  markPaid(report: Report) {
    (report as any).status = 'paid';
  }

  refund(report: Report) {
    (report as any).status = 'refunded';
  }

  formatCurrency(v: number) {
    return '$' + (Number(v) || 0).toFixed(2);
  }

  itemSubtotal(it: ReportItem) {
    return Number(
      it.totalPrice != null ? it.totalPrice : it.qty * it.price || 0
    );
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }
}
