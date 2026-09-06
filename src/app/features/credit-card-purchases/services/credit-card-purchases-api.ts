import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreditCardInstallmentStatus,
  CreditCardMonthlyPurchaseInstallment,
  CreditCardMonthlyPurchasesResponse,
  CreditCardPurchase,
  CreditCardPurchaseOverview,
  CreditCardPurchasePayload,
} from '../models/credit-card-purchase.models';

@Injectable({ providedIn: 'root' })
export class CreditCardPurchasesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/credit-card-purchases`;

  getOverview(): Observable<CreditCardPurchaseOverview> {
    return this.http.get<CreditCardPurchaseOverview>(this.baseUrl);
  }

  getMonthly(year: number, month: number): Observable<CreditCardMonthlyPurchasesResponse> {
    return this.http.get<CreditCardMonthlyPurchasesResponse>(`${this.baseUrl}/monthly`, {
      params: { year, month },
    });
  }

  get(id: string): Observable<CreditCardPurchase> {
    return this.http.get<CreditCardPurchase>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreditCardPurchasePayload): Observable<CreditCardPurchase> {
    return this.http.post<CreditCardPurchase>(this.baseUrl, payload);
  }

  updateInstallmentAmount(installmentId: string, amount: number): Observable<CreditCardMonthlyPurchaseInstallment> {
    return this.http.patch<CreditCardMonthlyPurchaseInstallment>(
      `${this.baseUrl}/installments/${installmentId}/amount`,
      { amount },
    );
  }

  updateInstallmentStatus(
    installmentId: string,
    status: CreditCardInstallmentStatus,
  ): Observable<CreditCardMonthlyPurchaseInstallment> {
    return this.http.patch<CreditCardMonthlyPurchaseInstallment>(
      `${this.baseUrl}/installments/${installmentId}/status`,
      { status },
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
