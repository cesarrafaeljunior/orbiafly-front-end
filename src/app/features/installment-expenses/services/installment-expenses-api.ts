import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  InstallmentPaymentResult,
  InstallmentPurchase,
  InstallmentPurchasePayload,
} from '../models/installment-expense.models';

@Injectable({ providedIn: 'root' })
export class InstallmentExpensesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/installment-expenses`;

  list(): Observable<InstallmentPurchase[]> {
    return this.http.get<InstallmentPurchase[]>(this.baseUrl);
  }

  create(payload: InstallmentPurchasePayload): Observable<InstallmentPurchase> {
    return this.http.post<InstallmentPurchase>(this.baseUrl, payload);
  }

  payInstallment(
    installmentId: string,
    financialAccountId: string,
    paymentDate: string,
  ): Observable<InstallmentPaymentResult> {
    return this.http.post<InstallmentPaymentResult>(`${this.baseUrl}/installments/${installmentId}/payment`, {
      financialAccountId,
      paymentDate,
    });
  }
}
