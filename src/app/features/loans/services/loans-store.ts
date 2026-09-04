import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FinancialAccount, FinancialAccountsOverview } from '../../accounts/models/account.models';
import { AccountsApi } from '../../accounts/services/accounts-api';
import { ToastService } from '../../../shared/services/toast.service';
import { ApiProblem, LoanEntryPayload, LoanOverview, LoanPayload } from '../models/loan.models';
import { LoansApi } from './loans-api';

const EMPTY_OVERVIEW: LoanOverview = {
  totalBorrowedRemaining: 0,
  totalLentRemaining: 0,
  activeLoanCount: 0,
  upcomingEntryCount: 0,
  loans: [],
};

@Injectable()
export class LoansStore {
  private readonly api = inject(LoansApi);
  private readonly accountsApi = inject(AccountsApi);
  private readonly toastService = inject(ToastService);

  readonly overview = signal<LoanOverview>(EMPTY_OVERVIEW);
  readonly accountsOverview = signal<FinancialAccountsOverview>({
    totalAvailableBalance: 0,
    activeCount: 0,
    accounts: [],
  });
  readonly loading = signal(true);
  readonly loadingAccounts = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeAccounts = computed<FinancialAccount[]>(() =>
    this.accountsOverview().accounts.filter((account) => account.active),
  );

  async initialize(): Promise<void> {
    await Promise.all([this.loadLoans(), this.loadAccounts()]);
  }

  async loadLoans(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.overview.set(await firstValueFrom(this.api.getOverview()));
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar os empréstimos.'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadAccounts(): Promise<void> {
    this.loadingAccounts.set(true);
    try {
      this.accountsOverview.set(await firstValueFrom(this.accountsApi.getOverview(false)));
    } catch (error: unknown) {
      this.toastService.error(this.errorMessage(error, 'Não foi possível carregar as contas ativas.'));
    } finally {
      this.loadingAccounts.set(false);
    }
  }

  async create(payload: LoanPayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await this.loadLoans();
      },
      'Empréstimo cadastrado com sucesso.',
      'Não foi possível cadastrar o empréstimo.',
    );
  }

  async registerEntry(id: string, payload: LoanEntryPayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.registerEntry(id, payload));
        await Promise.all([this.loadLoans(), this.loadAccounts()]);
      },
      'Lançamento registrado com sucesso.',
      'Não foi possível registrar o lançamento.',
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.delete(id));
        await this.loadLoans();
      },
      'Empréstimo excluído com sucesso.',
      'Não foi possível excluir o empréstimo.',
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
