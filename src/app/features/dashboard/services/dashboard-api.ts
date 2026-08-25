import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MonthlyDashboard } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);

  getMonthly(year: number, month: number): Observable<MonthlyDashboard> {
    return this.http.get<MonthlyDashboard>(`${environment.apiUrl}/dashboard/monthly`, {
      params: { year, month },
    });
  }
}
