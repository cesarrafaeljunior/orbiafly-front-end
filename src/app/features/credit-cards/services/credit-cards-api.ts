import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreditCard, CreditCardOverview, CreditCardPayload } from '../models/credit-card.models';

@Injectable({ providedIn: 'root' })
export class CreditCardsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/credit-cards`;

  getOverview(includeInactive = false): Observable<CreditCardOverview> {
    return this.http.get<CreditCardOverview>(this.baseUrl, {
      params: { includeInactive },
    });
  }

  get(id: string): Observable<CreditCard> {
    return this.http.get<CreditCard>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreditCardPayload): Observable<CreditCard> {
    return this.http.post<CreditCard>(this.baseUrl, payload);
  }

  update(id: string, payload: CreditCardPayload): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.baseUrl}/${id}`, payload);
  }

  deactivate(id: string): Observable<CreditCard> {
    return this.http.patch<CreditCard>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  reactivate(id: string): Observable<CreditCard> {
    return this.http.patch<CreditCard>(`${this.baseUrl}/${id}/reactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
