import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Category,
  FixedExpense,
  FixedExpensePaymentResult,
  FixedExpensePayload,
  MonthlyExpense,
  MonthlyExpensesResponse,
  PaymentStatus,
} from '../models/fixed-expense.models';

@Injectable({ providedIn: 'root' })
export class FixedExpensesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getMonthly(year: number, month: number): Observable<MonthlyExpensesResponse> {
    return this.http.get<MonthlyExpensesResponse>(`${this.baseUrl}/fixed-expenses/monthly`, {
      params: { year, month },
    });
  }

  create(payload: FixedExpensePayload): Observable<FixedExpense> {
    return this.http.post<FixedExpense>(`${this.baseUrl}/fixed-expenses`, payload);
  }

  update(id: string, payload: Required<FixedExpensePayload>): Observable<FixedExpense> {
    return this.http.put<FixedExpense>(`${this.baseUrl}/fixed-expenses/${id}`, payload);
  }

  updateAmount(occurrenceId: string, amount: number): Observable<MonthlyExpense> {
    return this.http.patch<MonthlyExpense>(
      `${this.baseUrl}/fixed-expense-occurrences/${occurrenceId}/amount`,
      { amount },
    );
  }

  updateStatus(occurrenceId: string, status: PaymentStatus): Observable<MonthlyExpense> {
    return this.http.patch<MonthlyExpense>(
      `${this.baseUrl}/fixed-expense-occurrences/${occurrenceId}/status`,
      { status },
    );
  }

  registerPayment(
    occurrenceId: string,
    financialAccountId: string,
    paymentDate: string,
  ): Observable<FixedExpensePaymentResult> {
    return this.http.post<FixedExpensePaymentResult>(
      `${this.baseUrl}/fixed-expense-occurrences/${occurrenceId}/payment`,
      { financialAccountId, paymentDate },
    );
  }
}
