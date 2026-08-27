import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ApiProblem,
  CreditCard,
  CreditCardOverview,
  CreditCardPayload,
} from '../models/credit-card.models';
import { ToastService } from '../../../shared/services/toast.service';
import { CreditCardsApi } from './credit-cards-api';

const EMPTY_OVERVIEW: CreditCardOverview = {
  totalLimit: 0,
  usedLimit: 0,
  availableLimit: 0,
  activeCount: 0,
  cards: [],
};

@Injectable()
export class CreditCardsStore {
  private readonly api = inject(CreditCardsApi);
  private readonly toastService = inject(ToastService);

  readonly overview = signal<CreditCardOverview>(EMPTY_OVERVIEW);
  readonly includeInactive = signal(false);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly usagePercentage = computed(() => {
    const totalLimit = this.overview().totalLimit;
    if (totalLimit <= 0) {
      return 0;
    }
    return Math.min(100, (this.overview().usedLimit / totalLimit) * 100);
  });

  async initialize(): Promise<void> {
    await this.loadCards();
  }

  async loadCards(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.overview.set(await firstValueFrom(this.api.getOverview(this.includeInactive())));
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar seus cartões.'));
    } finally {
      this.loading.set(false);
    }
  }

  async setIncludeInactive(value: boolean): Promise<void> {
    this.includeInactive.set(value);
    await this.loadCards();
  }

  async create(payload: CreditCardPayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await this.loadCards();
      },
      'Cartão criado com sucesso.',
      'Não foi possível criar o cartão.',
    );
  }

  async update(card: CreditCard, payload: CreditCardPayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.update(card.id, payload));
        await this.loadCards();
      },
      'Cartão atualizado com sucesso.',
      'Não foi possível atualizar o cartão.',
    );
  }

  async deactivate(card: CreditCard): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.deactivate(card.id));
        await this.loadCards();
      },
      'Cartão desativado com sucesso.',
      'Não foi possível desativar o cartão.',
    );
  }

  async reactivate(card: CreditCard): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.reactivate(card.id));
        await this.loadCards();
      },
      'Cartão reativado com sucesso.',
      'Não foi possível reativar o cartão.',
    );
  }

  async delete(card: CreditCard): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.delete(card.id));
        await this.loadCards();
      },
      'Cartão excluído com sucesso.',
      'Não foi possível excluir o cartão.',
    );
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
