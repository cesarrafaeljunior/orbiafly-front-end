import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiProblem, CreditCard, CreditCardOverview } from '../../credit-cards/models/credit-card.models';
import { CreditCardsApi } from '../../credit-cards/services/credit-cards-api';
import { ToastService } from '../../../shared/services/toast.service';
import {
  CreditCardInstallmentStatus,
  CreditCardInstallmentStatusFilter,
  CreditCardMonthlyPurchaseInstallment,
  CreditCardMonthlyPurchaseSummary,
  CreditCardPurchasePayload,
  CreditCardPurchaseSortOption,
} from '../models/credit-card-purchase.models';
import { CreditCardPurchasesApi } from './credit-card-purchases-api';

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const EMPTY_SUMMARY: CreditCardMonthlyPurchaseSummary = {
  total: 0,
  paidTotal: 0,
  pendingTotal: 0,
  totalCount: 0,
  paidCount: 0,
  pendingCount: 0,
  paidPercentage: 0,
};

@Injectable()
export class CreditCardPurchasesStore {
  private readonly api = inject(CreditCardPurchasesApi);
  private readonly cardsApi = inject(CreditCardsApi);
  private readonly toastService = inject(ToastService);
  private requestSequence = 0;

  readonly currentDate = new Date();
  readonly year = signal(this.currentDate.getFullYear());
  readonly month = signal(this.currentDate.getMonth() + 1);
  readonly items = signal<CreditCardMonthlyPurchaseInstallment[]>([]);
  readonly monthlySummary = signal<CreditCardMonthlyPurchaseSummary>(EMPTY_SUMMARY);
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
  readonly busyIds = signal<ReadonlySet<string>>(new Set());
  readonly search = signal('');
  readonly statusFilter = signal<CreditCardInstallmentStatusFilter>('ALL');
  readonly sortOption = signal<CreditCardPurchaseSortOption>('DUE_ASC');

  readonly activeCards = computed(() => this.cardsOverview().cards.filter((card) => card.active));

  readonly periodLabel = computed(() => {
    const label = monthFormatter.format(new Date(Date.UTC(this.year(), this.month() - 1, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  readonly summary = computed(() => ({
    ...this.monthlySummary(),
    paidPercentage: Number(this.monthlySummary().paidPercentage.toFixed(2)),
  }));

  readonly filteredItems = computed(() => {
    const status = this.statusFilter();
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    const sortOption = this.sortOption();
    return this.items().filter((item) => {
      const matchesStatus = status === 'ALL' || item.status === status;
      const searchable = [item.description, item.creditCardName, item.creditCardBrand]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('pt-BR');
      return matchesStatus && (!search || searchable.includes(search));
    }).sort((first, second) => this.compareItems(first, second, sortOption));
  });

  async initialize(): Promise<void> {
    await Promise.all([this.loadMonth(), this.loadCards()]);
  }

  async loadMonth(): Promise<void> {
    const requestId = ++this.requestSequence;
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.api.getMonthly(this.year(), this.month()));
      if (requestId === this.requestSequence) {
        this.items.set(response.items);
        this.monthlySummary.set(this.normalizeSummary(response.summary, response.items.length));
      }
    } catch (error: unknown) {
      if (requestId === this.requestSequence) {
        this.error.set(this.errorMessage(error, 'Não foi possível carregar esta competência.'));
      }
    } finally {
      if (requestId === this.requestSequence) {
        this.loading.set(false);
      }
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

  async moveMonth(offset: number): Promise<void> {
    const date = new Date(Date.UTC(this.year(), this.month() - 1 + offset, 1));
    this.year.set(date.getUTCFullYear());
    this.month.set(date.getUTCMonth() + 1);
    await this.loadMonth();
  }

  async create(payload: CreditCardPurchasePayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await Promise.all([this.loadMonth(), this.loadCards()]);
      },
      'Compra parcelada registrada com sucesso.',
      'Não foi possível registrar a compra parcelada.',
    );
  }

  async updateAmount(item: CreditCardMonthlyPurchaseInstallment, amount: number): Promise<boolean> {
    return this.runSubmission(
      async () => {
        const updated = await firstValueFrom(this.api.updateInstallmentAmount(item.installmentId, amount));
        this.replaceItem(updated);
        this.recalculateSummary();
        await this.loadCards();
      },
      'Valor desta parcela atualizado.',
      'Não foi possível atualizar a parcela.',
    );
  }

  async toggleStatus(item: CreditCardMonthlyPurchaseInstallment): Promise<void> {
    if (this.busyIds().has(item.installmentId)) {
      return;
    }
    const nextStatus: CreditCardInstallmentStatus = item.status === 'PAID' ? 'PENDING' : 'PAID';
    const previousItems = this.items();
    this.markBusy(item.installmentId, true);
    this.replaceItem({
      ...item,
      status: nextStatus,
      paidAt: nextStatus === 'PAID' ? new Date().toISOString() : null,
    });
    this.recalculateSummary();
    try {
      const updated = await firstValueFrom(this.api.updateInstallmentStatus(item.installmentId, nextStatus));
      this.replaceItem(updated);
      this.recalculateSummary();
      await this.loadCards();
      this.toastService.success(nextStatus === 'PAID' ? 'Parcela marcada como paga.' : 'Parcela voltou para pendente.');
    } catch (error: unknown) {
      this.items.set(previousItems);
      this.recalculateSummary();
      this.toastService.error(this.errorMessage(error, 'Não foi possível alterar a parcela.'));
    } finally {
      this.markBusy(item.installmentId, false);
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.delete(id));
        await Promise.all([this.loadMonth(), this.loadCards()]);
      },
      'Compra parcelada excluída com sucesso.',
      'Não foi possível excluir a compra parcelada.',
    );
  }

  cardById(id: string): CreditCard | null {
    return this.activeCards().find((card) => card.id === id) ?? null;
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('ALL');
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

  private replaceItem(updated: CreditCardMonthlyPurchaseInstallment): void {
    this.items.update((items) =>
      items.map((item) => (item.installmentId === updated.installmentId ? updated : item)),
    );
  }

  private recalculateSummary(): void {
    const paidItems = this.items().filter((item) => item.status === 'PAID');
    const pendingItems = this.items().filter((item) => item.status === 'PENDING');
    const paidCents = paidItems.reduce((total, item) => total + this.toCents(item.amount), 0);
    const pendingCents = pendingItems.reduce((total, item) => total + this.toCents(item.amount), 0);
    const totalCents = paidCents + pendingCents;
    this.monthlySummary.set({
      total: totalCents / 100,
      paidTotal: paidCents / 100,
      pendingTotal: pendingCents / 100,
      totalCount: this.items().length,
      paidCount: paidItems.length,
      pendingCount: pendingItems.length,
      paidPercentage: totalCents === 0 ? 0 : (paidCents / totalCents) * 100,
    });
  }

  private markBusy(id: string, busy: boolean): void {
    this.busyIds.update((current) => {
      const next = new Set(current);
      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private normalizeSummary(
    summary: CreditCardMonthlyPurchaseSummary,
    totalCount: number,
  ): CreditCardMonthlyPurchaseSummary {
    const paidPercentage = summary.paidPercentage ?? (summary.total === 0 ? 0 : (summary.paidTotal / summary.total) * 100);
    return {
      ...summary,
      totalCount: summary.totalCount ?? totalCount,
      paidPercentage,
    };
  }

  private compareItems(
    first: CreditCardMonthlyPurchaseInstallment,
    second: CreditCardMonthlyPurchaseInstallment,
    sortOption: CreditCardPurchaseSortOption,
  ): number {
    switch (sortOption) {
      case 'DUE_DESC':
        return second.dueDate.localeCompare(first.dueDate);
      case 'AMOUNT_DESC':
        return this.toCents(second.amount) - this.toCents(first.amount);
      case 'AMOUNT_ASC':
        return this.toCents(first.amount) - this.toCents(second.amount);
      case 'NAME_ASC':
        return first.description.localeCompare(second.description, 'pt-BR');
      case 'NAME_DESC':
        return second.description.localeCompare(first.description, 'pt-BR');
      case 'DUE_ASC':
      default:
        return first.dueDate.localeCompare(second.dueDate);
    }
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ApiProblem | null;
      return problem?.detail ?? fallback;
    }
    return fallback;
  }

  private toCents(value: number): number {
    return Math.round(value * 100);
  }
}
