import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FinancialAccount } from '../../accounts/models/account.models';
import { AccountsApi } from '../../accounts/services/accounts-api';
import {
  ApiProblem,
  Category,
  ExpenseStatusFilter,
  FixedExpensePayload,
  MonthlyExpense,
  PaymentStatus,
} from '../models/fixed-expense.models';
import { ToastService } from '../../../shared/services/toast.service';
import { FixedExpensesApi } from './fixed-expenses-api';

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

@Injectable()
export class FixedExpensesStore {
  private readonly api = inject(FixedExpensesApi);
  private readonly accountsApi = inject(AccountsApi);
  private readonly toastService = inject(ToastService);
  private requestSequence = 0;

  readonly currentDate = new Date();
  readonly year = signal(this.currentDate.getFullYear());
  readonly month = signal(this.currentDate.getMonth() + 1);
  readonly items = signal<MonthlyExpense[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly accounts = signal<FinancialAccount[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly busyIds = signal<ReadonlySet<string>>(new Set());
  readonly statusFilter = signal<ExpenseStatusFilter>('ALL');
  readonly categoryFilter = signal('ALL');
  readonly search = signal('');

  readonly periodLabel = computed(() => {
    const label = monthFormatter.format(new Date(Date.UTC(this.year(), this.month() - 1, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  readonly filteredItems = computed(() => {
    const status = this.statusFilter();
    const category = this.categoryFilter();
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    return this.items().filter((item) => {
      const matchesStatus = status === 'ALL' || item.status === status;
      const matchesCategory = category === 'ALL' || item.categoryId === category;
      const matchesSearch = !search || item.name.toLocaleLowerCase('pt-BR').includes(search);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  });

  readonly summary = computed(() => {
    const paidItems = this.items().filter((item) => item.status === 'PAID');
    const pendingItems = this.items().filter((item) => item.status === 'PENDING');
    const paidCents = paidItems.reduce((total, item) => total + this.toCents(item.amount), 0);
    const pendingCents = pendingItems.reduce((total, item) => total + this.toCents(item.amount), 0);
    return {
      total: (paidCents + pendingCents) / 100,
      paidTotal: paidCents / 100,
      pendingTotal: pendingCents / 100,
      paidCount: paidItems.length,
      pendingCount: pendingItems.length,
    };
  });

  readonly hasActiveFilters = computed(
    () =>
      this.statusFilter() !== 'ALL' ||
      this.categoryFilter() !== 'ALL' ||
      this.search().trim().length > 0,
  );

  async initialize(): Promise<void> {
    await Promise.all([this.loadCategories(), this.loadAccounts(), this.loadMonth()]);
  }

  async loadAccounts(): Promise<void> {
    try {
      const overview = await firstValueFrom(this.accountsApi.getOverview());
      this.accounts.set(overview.accounts);
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar as contas de pagamento.'));
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories.set(await firstValueFrom(this.api.getCategories()));
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar as categorias.'));
    }
  }

  async loadMonth(): Promise<void> {
    const requestId = ++this.requestSequence;
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.api.getMonthly(this.year(), this.month()));
      if (requestId === this.requestSequence) {
        this.items.set(response.items);
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

  async moveMonth(offset: number): Promise<void> {
    const date = new Date(Date.UTC(this.year(), this.month() - 1 + offset, 1));
    this.year.set(date.getUTCFullYear());
    this.month.set(date.getUTCMonth() + 1);
    await this.loadMonth();
  }

  async create(payload: FixedExpensePayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await this.loadMonth();
      },
      'Despesa fixa criada.',
      'Não foi possível criar a despesa.',
    );
  }

  async update(item: MonthlyExpense, payload: Required<FixedExpensePayload>): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.update(item.fixedExpenseId, payload));
        await this.loadMonth();
      },
      'Despesa atualizada para as próximas ocorrências.',
      'Não foi possível atualizar a despesa.',
    );
  }

  async updateAmount(item: MonthlyExpense, amount: number): Promise<boolean> {
    return this.runSubmission(
      async () => {
        const updated = await firstValueFrom(this.api.updateAmount(item.occurrenceId, amount));
        this.replaceItem(updated);
      },
      'Valor desta competência atualizado.',
      'Não foi possível atualizar o valor mensal.',
    );
  }

  async toggleStatus(item: MonthlyExpense): Promise<void> {
    if (this.busyIds().has(item.occurrenceId)) {
      return;
    }
    const nextStatus: PaymentStatus = item.status === 'PAID' ? 'PENDING' : 'PAID';
    const previousItems = this.items();
    this.markBusy(item.occurrenceId, true);
    this.replaceItem({
      ...item,
      status: nextStatus,
      paidAt: nextStatus === 'PAID' ? new Date().toISOString() : null,
    });
    this.error.set(null);
    try {
      const updated = await firstValueFrom(this.api.updateStatus(item.occurrenceId, nextStatus));
      this.replaceItem(updated);
      if (nextStatus === 'PENDING' && item.financialAccountId) {
        await this.loadAccounts();
      }
      this.toastService.success(
        nextStatus === 'PAID' ? 'Pagamento registrado.' : 'Pagamento voltou para pendente.',
      );
    } catch (error: unknown) {
      this.items.set(previousItems);
      this.toastService.error(this.errorMessage(error, 'Não foi possível alterar o pagamento.'));
    } finally {
      this.markBusy(item.occurrenceId, false);
    }
  }

  async registerPayment(
    item: MonthlyExpense,
    financialAccountId: string,
    paymentDate: string,
  ): Promise<boolean> {
    if (this.busyIds().has(item.occurrenceId)) {
      return false;
    }
    this.markBusy(item.occurrenceId, true);
    this.submitting.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.api.registerPayment(item.occurrenceId, financialAccountId, paymentDate),
      );
      this.replaceItem(result.occurrence);
      this.accounts.update((accounts) =>
        accounts.map((account) =>
          account.id === result.financialAccount.id
            ? { ...account, currentBalance: result.updatedBalance }
            : account,
        ),
      );
      if (result.negativeBalance) {
        this.toastService.warning('Pagamento registrado. A conta ficou com saldo negativo.');
      } else {
        this.toastService.success('Pagamento e movimentação registrados.');
      }
      return true;
    } catch (error: unknown) {
      this.toastService.error(this.errorMessage(error, 'Não foi possível registrar o pagamento.'));
      return false;
    } finally {
      this.submitting.set(false);
      this.markBusy(item.occurrenceId, false);
    }
  }

  clearFilters(): void {
    this.statusFilter.set('ALL');
    this.categoryFilter.set('ALL');
    this.search.set('');
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

  private replaceItem(updated: MonthlyExpense): void {
    this.items.update((items) =>
      items.map((item) => (item.occurrenceId === updated.occurrenceId ? updated : item)),
    );
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
