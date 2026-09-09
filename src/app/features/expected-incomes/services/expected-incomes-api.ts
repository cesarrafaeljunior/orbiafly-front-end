import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ExpectedIncome,
  ExpectedIncomeOverview,
  ExpectedIncomePayload,
  ExpectedIncomeReceiptResult,
  ReceiveExpectedIncomePayload,
} from '../models/expected-income.models';

@Injectable({ providedIn: 'root' })
export class ExpectedIncomesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/expected-incomes`;

  getOverview(): Observable<ExpectedIncomeOverview> {
    return this.http.get<ExpectedIncomeOverview>(this.baseUrl);
  }

  get(id: string): Observable<ExpectedIncome> {
    return this.http.get<ExpectedIncome>(`${this.baseUrl}/${id}`);
  }

  create(payload: ExpectedIncomePayload): Observable<ExpectedIncome> {
    return this.http.post<ExpectedIncome>(this.baseUrl, payload);
  }

  update(id: string, payload: ExpectedIncomePayload): Observable<ExpectedIncome> {
    return this.http.put<ExpectedIncome>(`${this.baseUrl}/${id}`, payload);
  }

  receive(
    id: string,
    payload: ReceiveExpectedIncomePayload,
  ): Observable<ExpectedIncomeReceiptResult> {
    return this.http.post<ExpectedIncomeReceiptResult>(`${this.baseUrl}/${id}/receive`, payload);
  }

  cancel(id: string): Observable<ExpectedIncome> {
    return this.http.patch<ExpectedIncome>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
