import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Loan, LoanEntryPayload, LoanOverview, LoanPayload } from '../models/loan.models';

@Injectable({ providedIn: 'root' })
export class LoansApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/loans`;

  getOverview(): Observable<LoanOverview> {
    return this.http.get<LoanOverview>(this.baseUrl);
  }

  get(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.baseUrl}/${id}`);
  }

  create(payload: LoanPayload): Observable<Loan> {
    return this.http.post<Loan>(this.baseUrl, payload);
  }

  registerEntry(id: string, payload: LoanEntryPayload): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/${id}/entries`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
