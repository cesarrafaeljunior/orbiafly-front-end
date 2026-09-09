import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  MonthlyOneOffExpensesResponse,
  OneOffExpense,
  OneOffExpensePaymentResult,
  OneOffExpensePayload,
  PaymentStatus,
} from '../models/one-off-expense.models';

@Injectable({ providedIn: 'root' })
export class OneOffExpensesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/one-off-expenses`;

  getMonthly(year: number, month: number): Observable<MonthlyOneOffExpensesResponse> {
    return this.http.get<MonthlyOneOffExpensesResponse>(this.baseUrl, { params: { year, month } });
  }

  create(payload: OneOffExpensePayload): Observable<OneOffExpense> {
    return this.http.post<OneOffExpense>(this.baseUrl, payload);
  }

  update(id: string, payload: OneOffExpensePayload): Observable<OneOffExpense> {
    return this.http.put<OneOffExpense>(`${this.baseUrl}/${id}`, payload);
  }

  updateStatus(id: string, status: PaymentStatus): Observable<OneOffExpense> {
    return this.http.patch<OneOffExpense>(`${this.baseUrl}/${id}/status`, { status });
  }

  registerPayment(
    id: string,
    financialAccountId: string,
    paymentDate: string,
  ): Observable<OneOffExpensePaymentResult> {
    return this.http.post<OneOffExpensePaymentResult>(`${this.baseUrl}/${id}/payment`, {
      financialAccountId,
      paymentDate,
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
