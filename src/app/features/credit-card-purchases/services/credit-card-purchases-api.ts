import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
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

  get(id: string): Observable<CreditCardPurchase> {
    return this.http.get<CreditCardPurchase>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreditCardPurchasePayload): Observable<CreditCardPurchase> {
    return this.http.post<CreditCardPurchase>(this.baseUrl, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
