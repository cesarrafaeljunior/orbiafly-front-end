import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiProblem, CreditCard, CreditCardOverview } from '../../credit-cards/models/credit-card.models';
import { CreditCardsApi } from '../../credit-cards/services/credit-cards-api';
import { ToastService } from '../../../shared/services/toast.service';
import {
  CreditCardPurchaseOverview,
  CreditCardPurchasePayload,
} from '../models/credit-card-purchase.models';
import { CreditCardPurchasesApi } from './credit-card-purchases-api';

const EMPTY_OVERVIEW: CreditCardPurchaseOverview = {
  totalCommitted: 0,
  activePurchaseCount: 0,
  futureInstallmentCount: 0,
  currentMonthInstallmentsAmount: 0,
  purchases: [],
};

@Injectable()
export class CreditCardPurchasesStore {
  private readonly api = inject(CreditCardPurchasesApi);
  private readonly cardsApi = inject(CreditCardsApi);
  private readonly toastService = inject(ToastService);

  readonly overview = signal<CreditCardPurchaseOverview>(EMPTY_OVERVIEW);
  readonly cardsOverview = signal<CreditCardOverview>({
    totalLimit: 0,
    usedLimit: 0,
    availableLimit: 0,
    activeCount: 0,
    cards: [],
  });
  readonly loading = signal(true);
  readonly loadingCards = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeCards = computed(() => this.cardsOverview().cards.filter((card) => card.active));

  async initialize(): Promise<void> {
    await Promise.all([this.loadPurchases(), this.loadCards()]);
  }

  async loadPurchases(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.overview.set(await firstValueFrom(this.api.getOverview()));
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar as compras parceladas.'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadCards(): Promise<void> {
    this.loadingCards.set(true);
    try {
      this.cardsOverview.set(await firstValueFrom(this.cardsApi.getOverview(false)));
    } catch (error: unknown) {
      this.toastService.error(this.errorMessage(error, 'Não foi possível carregar os cartões ativos.'));
    } finally {
      this.loadingCards.set(false);
    }
  }

  async create(payload: CreditCardPurchasePayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await Promise.all([this.loadPurchases(), this.loadCards()]);
      },
      'Compra parcelada registrada com sucesso.',
      'Não foi possível registrar a compra parcelada.',
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.delete(id));
        await Promise.all([this.loadPurchases(), this.loadCards()]);
      },
      'Compra parcelada excluída com sucesso.',
      'Não foi possível excluir a compra parcelada.',
    );
  }

  cardById(id: string): CreditCard | null {
    return this.activeCards().find((card) => card.id === id) ?? null;
  }

  private async runSubmission(
    action: () => Promise<void>,
    successMessage: string,
    fallbackError: string,
  ): Promise<boolean> {
    this.submitting.set(true);
    this.error.set(null);
    try {
      await action();
      this.toastService.success(successMessage);
      return true;
    } catch (error: unknown) {
      this.toastService.error(this.errorMessage(error, fallbackError));
      return false;
    } finally {
      this.submitting.set(false);
    }
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ApiProblem | null;
      return problem?.detail ?? fallback;
    }
    return fallback;
  }
}
