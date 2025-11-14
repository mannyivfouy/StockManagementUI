import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReportItem {
  productID: any;
  productName: string;
  qty: number;
  price: number;
  totalPrice: number;
}

export interface Report {
  reportID: any;
  userID: any;
  username: string;  
  items: ReportItem[];
  totalAmount: number;
  purchase_date: string;
  create_date: string;
}

export interface CreateReportPayload {
  userID: number;
  purchase_date?: string;
  items: { productID: number; qty: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private reportAPI = 'http://localhost:4000/api/report';

  constructor(private http: HttpClient) {}

  createReport(
    payload: CreateReportPayload
  ): Observable<{ message: string; report: Report }> {
    return this.http.post<{ message: string; report: Report }>(
      this.reportAPI,
      payload
    );
  }

  /**
   * Get all reports (sorted by create_date descending on backend).
   */
  getAllReport(): Observable<Report[]> {
    return this.http.get<Report[]>(this.reportAPI);
  }
}
