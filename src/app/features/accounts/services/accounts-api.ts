import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AccountTransactionResult,
  AccountTransferOverview,
  AccountTransferPayload,
  AccountTransferResult,
  FinancialAccount,
  FinancialAccountPayload,
  FinancialAccountsOverview,
  FinancialTransaction,
} from '../models/account.models';

@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/accounts`;
  private readonly transfersUrl = `${environment.apiUrl}/account-transfers`;

  getOverview(includeInactive = false): Observable<FinancialAccountsOverview> {
    return this.http.get<FinancialAccountsOverview>(this.baseUrl, {
      params: { includeInactive },
    });
  }

  get(id: string): Observable<FinancialAccount> {
    return this.http.get<FinancialAccount>(`${this.baseUrl}/${id}`);
  }

  create(payload: Required<FinancialAccountPayload>): Observable<FinancialAccount> {
    return this.http.post<FinancialAccount>(this.baseUrl, payload);
  }

  update(id: string, payload: FinancialAccountPayload): Observable<FinancialAccount> {
    return this.http.put<FinancialAccount>(`${this.baseUrl}/${id}`, {
      name: payload.name,
      type: payload.type,
      institution: payload.institution,
    });
  }

  deactivate(id: string): Observable<FinancialAccount> {
    return this.http.patch<FinancialAccount>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  reactivate(id: string): Observable<FinancialAccount> {
    return this.http.patch<FinancialAccount>(`${this.baseUrl}/${id}/reactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTransactions(id: string): Observable<FinancialTransaction[]> {
    return this.http.get<FinancialTransaction[]>(`${this.baseUrl}/${id}/transactions`);
  }

  getTransfers(): Observable<AccountTransferOverview> {
    return this.http.get<AccountTransferOverview>(this.transfersUrl);
  }

  transfer(payload: AccountTransferPayload): Observable<AccountTransferResult> {
    return this.http.post<AccountTransferResult>(this.transfersUrl, payload);
  }

  adjustBalance(
    id: string,
    targetBalance: number,
    description: string,
  ): Observable<AccountTransactionResult> {
    return this.http.post<AccountTransactionResult>(`${this.baseUrl}/${id}/adjustments`, {
      targetBalance,
      description,
    });
  }
}
