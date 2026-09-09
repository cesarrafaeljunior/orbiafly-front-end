import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FinancialAccount } from '../../accounts/models/account.models';
import { AccountsApi } from '../../accounts/services/accounts-api';
import { ApiProblem } from '../../fixed-expenses/models/fixed-expense.models';
import { FixedExpensesApi } from '../../fixed-expenses/services/fixed-expenses-api';
import { ToastService } from '../../../shared/services/toast.service';
import {
  Category,
  MonthlySummary,
  OneOffExpense,
  OneOffExpenseFilter,
  OneOffExpensePayload,
  PaymentStatus,
} from '../models/one-off-expense.models';
import { OneOffExpensesApi } from './one-off-expenses-api';

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long', year: 'numeric', timeZone: 'UTC',
});

const emptySummary: MonthlySummary = {
  total: 0, paidTotal: 0, pendingTotal: 0,
  totalCount: 0, paidCount: 0, pendingCount: 0, paidPercentage: 0,
};

@Injectable()
export class OneOffExpensesStore {
  private readonly api = inject(OneOffExpensesApi);
  private readonly fixedExpensesApi = inject(FixedExpensesApi);
  private readonly accountsApi = inject(AccountsApi);
  private readonly toast = inject(ToastService);
  private requestSequence = 0;

  private readonly today = new Date();
  readonly year = signal(this.today.getFullYear());
  readonly month = signal(this.today.getMonth() + 1);
  readonly items = signal<OneOffExpense[]>([]);
  readonly summary = signal<MonthlySummary>(emptySummary);
  readonly categories = signal<Category[]>([]);
  readonly accounts = signal<FinancialAccount[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly busyIds = signal<ReadonlySet<string>>(new Set());
  readonly statusFilter = signal<OneOffExpenseFilter>('ALL');
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
      const matchesStatus = status === 'ALL' || item.status === status || (status === 'OVERDUE' && item.overdue);
      const matchesCategory = category === 'ALL' || item.categoryId === category;
      const matchesSearch = !search || `${item.name} ${item.category}`.toLocaleLowerCase('pt-BR').includes(search);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  });

  async initialize(): Promise<void> {
    await Promise.all([this.loadMonth(), this.loadCategories(), this.loadAccounts()]);
  }

  async loadMonth(): Promise<void> {
    const requestId = ++this.requestSequence;
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.api.getMonthly(this.year(), this.month()));
      if (requestId === this.requestSequence) {
        this.items.set(response.items);
        this.summary.set(response.summary);
      }
    } catch (error: unknown) {
      if (requestId === this.requestSequence) {
        this.error.set(this.errorMessage(error, 'Não foi possível carregar os gastos avulsos.'));
      }
    } finally {
      if (requestId === this.requestSequence) this.loading.set(false);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories.set(await firstValueFrom(this.fixedExpensesApi.getCategories()));
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar as categorias.'));
    }
  }

  async loadAccounts(): Promise<void> {
    try {
      this.accounts.set((await firstValueFrom(this.accountsApi.getOverview())).accounts);
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar as contas.'));
    }
  }

  async moveMonth(offset: number): Promise<void> {
    const date = new Date(Date.UTC(this.year(), this.month() - 1 + offset, 1));
    this.year.set(date.getUTCFullYear());
    this.month.set(date.getUTCMonth() + 1);
    await this.loadMonth();
  }

  async create(payload: OneOffExpensePayload): Promise<boolean> {
    return this.submit(async () => {
      await firstValueFrom(this.api.create(payload));
      this.syncPeriod(payload.expenseDate);
      await this.loadMonth();
    }, 'Gasto avulso adicionado.', 'Não foi possível adicionar o gasto.');
  }

  async update(item: OneOffExpense, payload: OneOffExpensePayload): Promise<boolean> {
    return this.submit(async () => {
      await firstValueFrom(this.api.update(item.id, payload));
      this.syncPeriod(payload.expenseDate);
      await this.loadMonth();
    }, 'Gasto avulso atualizado.', 'Não foi possível atualizar o gasto.');
  }

  async delete(item: OneOffExpense): Promise<boolean> {
    return this.submit(async () => {
      await firstValueFrom(this.api.delete(item.id));
      await this.loadMonth();
    }, 'Gasto avulso excluído.', 'Não foi possível excluir o gasto.');
  }

  async toggleStatus(item: OneOffExpense): Promise<void> {
    if (this.busyIds().has(item.id)) return;
    const next: PaymentStatus = item.status === 'PAID' ? 'PENDING' : 'PAID';
    this.markBusy(item.id, true);
    try {
      const updated = await firstValueFrom(this.api.updateStatus(item.id, next));
      this.replace(updated);
      this.recalculateSummary();
      if (next === 'PENDING' && item.financialAccountId) await this.loadAccounts();
      this.toast.success(next === 'PAID' ? 'Pagamento registrado.' : 'Gasto voltou para pendente.');
    } catch (error: unknown) {
      this.toast.error(this.errorMessage(error, 'Não foi possível alterar o status.'));
    } finally {
      this.markBusy(item.id, false);
    }
  }

  async registerPayment(item: OneOffExpense, accountId: string, paymentDate: string): Promise<boolean> {
    if (this.busyIds().has(item.id)) return false;
    this.markBusy(item.id, true);
    this.submitting.set(true);
    try {
      const result = await firstValueFrom(this.api.registerPayment(item.id, accountId, paymentDate));
      this.replace(result.expense);
      this.recalculateSummary();
      this.accounts.update((accounts) => accounts.map((account) =>
        account.id === result.financialAccount.id
          ? { ...account, currentBalance: result.updatedBalance }
          : account));
      if (result.negativeBalance) this.toast.warning('Pagamento registrado. A conta ficou com saldo negativo.');
      else this.toast.success('Pagamento registrado com sucesso.');
      return true;
    } catch (error: unknown) {
      this.toast.error(this.errorMessage(error, 'Não foi possível registrar o pagamento.'));
      return false;
    } finally {
      this.submitting.set(false);
      this.markBusy(item.id, false);
    }
  }

  private syncPeriod(expenseDate: string): void {
    const [year, month] = expenseDate.split('-').map(Number);
    this.year.set(year);
    this.month.set(month);
  }

  private replace(updated: OneOffExpense): void {
    this.items.update((items) => items.map((item) => item.id === updated.id ? updated : item));
  }

  private recalculateSummary(): void {
    const paid = this.items().filter((item) => item.status === 'PAID');
    const pending = this.items().filter((item) => item.status === 'PENDING');
    const paidCents = paid.reduce((total, item) => total + Math.round(item.amount * 100), 0);
    const pendingCents = pending.reduce((total, item) => total + Math.round(item.amount * 100), 0);
    const totalCents = paidCents + pendingCents;
    this.summary.set({
      total: totalCents / 100, paidTotal: paidCents / 100, pendingTotal: pendingCents / 100,
      totalCount: this.items().length, paidCount: paid.length, pendingCount: pending.length,
      paidPercentage: totalCents === 0 ? 0 : paidCents / totalCents * 100,
    });
  }

  private async submit(action: () => Promise<void>, success: string, fallback: string): Promise<boolean> {
    this.submitting.set(true);
    try {
      await action();
      this.toast.success(success);
      return true;
    } catch (error: unknown) {
      this.toast.error(this.errorMessage(error, fallback));
      return false;
    } finally {
      this.submitting.set(false);
    }
  }

  private markBusy(id: string, busy: boolean): void {
    this.busyIds.update((ids) => {
      const next = new Set(ids);
      if (busy) next.add(id); else next.delete(id);
      return next;
    });
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return (error.error as ApiProblem | null)?.detail ?? fallback;
    }
    return fallback;
  }
}
