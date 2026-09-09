import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FinancialAccount, FinancialAccountsOverview } from '../../accounts/models/account.models';
import { AccountsApi } from '../../accounts/services/accounts-api';
import { ToastService } from '../../../shared/services/toast.service';
import {
  ApiProblem,
  ExpectedIncome,
  ExpectedIncomeOverview,
  ExpectedIncomePayload,
  ReceiveExpectedIncomePayload,
} from '../models/expected-income.models';
import { ExpectedIncomesApi } from './expected-incomes-api';

const EMPTY_OVERVIEW: ExpectedIncomeOverview = {
  pendingTotal: 0,
  receivedTotal: 0,
  canceledTotal: 0,
  pendingCount: 0,
  receivedCount: 0,
  canceledCount: 0,
  items: [],
};

@Injectable()
export class ExpectedIncomesStore {
  private readonly api = inject(ExpectedIncomesApi);
  private readonly accountsApi = inject(AccountsApi);
  private readonly toastService = inject(ToastService);

  readonly overview = signal<ExpectedIncomeOverview>(EMPTY_OVERVIEW);
  readonly accountsOverview = signal<FinancialAccountsOverview>({
    totalAvailableBalance: 0,
    activeCount: 0,
    accounts: [],
  });
  readonly loading = signal(true);
  readonly loadingAccounts = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeAccounts = computed(() =>
    this.accountsOverview().accounts.filter((account) => account.active),
  );

  async initialize(): Promise<void> {
    await Promise.all([this.loadIncomes(), this.loadAccounts()]);
  }

  async loadIncomes(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.overview.set(await firstValueFrom(this.api.getOverview()));
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar os recebimentos.'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadAccounts(): Promise<void> {
    this.loadingAccounts.set(true);
    try {
      this.accountsOverview.set(await firstValueFrom(this.accountsApi.getOverview(false)));
    } catch (error: unknown) {
      this.toastService.error(this.errorMessage(error, 'Não foi possível carregar as contas.'));
    } finally {
      this.loadingAccounts.set(false);
    }
  }

  async create(payload: ExpectedIncomePayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await this.loadIncomes();
      },
      'Recebimento previsto cadastrado.',
      'Não foi possível cadastrar o recebimento.',
    );
  }

  async update(income: ExpectedIncome, payload: ExpectedIncomePayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.update(income.id, payload));
        await this.loadIncomes();
      },
      'Recebimento atualizado.',
      'Não foi possível atualizar o recebimento.',
    );
  }

  async receive(income: ExpectedIncome, payload: ReceiveExpectedIncomePayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.receive(income.id, payload));
        await Promise.all([this.loadIncomes(), this.loadAccounts()]);
      },
      'Recebimento efetivado na conta.',
      'Não foi possível efetivar o recebimento.',
    );
  }

  async cancel(income: ExpectedIncome): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.cancel(income.id));
        await this.loadIncomes();
      },
      'Recebimento cancelado.',
      'Não foi possível cancelar o recebimento.',
    );
  }

  accountById(id: string): FinancialAccount | null {
    return this.activeAccounts().find((account) => account.id === id) ?? null;
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
