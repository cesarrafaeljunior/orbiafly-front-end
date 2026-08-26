import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ApiProblem,
  FinancialAccount,
  FinancialAccountPayload,
  FinancialAccountsOverview,
  FinancialTransaction,
} from '../models/account.models';
import { ToastService } from '../../../shared/services/toast.service';
import { AccountsApi } from './accounts-api';

const EMPTY_OVERVIEW: FinancialAccountsOverview = {
  totalAvailableBalance: 0,
  activeCount: 0,
  accounts: [],
};

@Injectable()
export class AccountsStore {
  private readonly api = inject(AccountsApi);
  private readonly toastService = inject(ToastService);

  readonly overview = signal<FinancialAccountsOverview>(EMPTY_OVERVIEW);
  readonly transactions = signal<FinancialTransaction[]>([]);
  readonly selectedAccountId = signal<string | null>(null);
  readonly includeInactive = signal(false);
  readonly loading = signal(true);
  readonly loadingTransactions = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly selectedAccount = computed(
    () =>
      this.overview().accounts.find((account) => account.id === this.selectedAccountId()) ?? null,
  );

  async initialize(): Promise<void> {
    await this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const overview = await firstValueFrom(this.api.getOverview(this.includeInactive()));
      this.overview.set(overview);
      const selectedId = this.selectedAccountId();
      if (selectedId && !overview.accounts.some((account) => account.id === selectedId)) {
        this.closeTransactions();
      }
    } catch (error: unknown) {
      this.error.set(this.errorMessage(error, 'Não foi possível carregar suas contas.'));
    } finally {
      this.loading.set(false);
    }
  }

  async setIncludeInactive(value: boolean): Promise<void> {
    this.includeInactive.set(value);
    await this.loadAccounts();
  }

  async create(payload: Required<FinancialAccountPayload>): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.create(payload));
        await this.loadAccounts();
      },
      'Conta criada com saldo inicial registrado.',
      'Não foi possível criar a conta.',
    );
  }

  async update(account: FinancialAccount, payload: FinancialAccountPayload): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.update(account.id, payload));
        await this.loadAccounts();
      },
      'Dados da conta atualizados.',
      'Não foi possível atualizar a conta.',
    );
  }

  async deactivate(account: FinancialAccount): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.deactivate(account.id));
        await this.loadAccounts();
      },
      'Conta desativada. O histórico foi preservado.',
      'Não foi possível desativar a conta.',
    );
  }

  async reactivate(account: FinancialAccount): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.reactivate(account.id));
        await this.loadAccounts();
      },
      'Conta reativada. O histórico foi preservado.',
      'Não foi possível reativar a conta.',
    );
  }

  async delete(account: FinancialAccount): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.delete(account.id));
        if (this.selectedAccountId() === account.id) {
          this.closeTransactions();
        }
        await this.loadAccounts();
      },
      'Conta excluída definitivamente.',
      'Não foi possível excluir a conta.',
    );
  }

  async openTransactions(account: FinancialAccount): Promise<void> {
    this.selectedAccountId.set(account.id);
    this.loadingTransactions.set(true);
    this.error.set(null);
    try {
      this.transactions.set(await firstValueFrom(this.api.getTransactions(account.id)));
    } catch (error: unknown) {
      this.toastService.error(
        this.errorMessage(error, 'Não foi possível carregar as movimentações.'),
      );
    } finally {
      this.loadingTransactions.set(false);
    }
  }

  closeTransactions(): void {
    this.selectedAccountId.set(null);
    this.transactions.set([]);
  }

  async adjust(
    account: FinancialAccount,
    targetBalance: number,
    description: string,
  ): Promise<boolean> {
    return this.runSubmission(
      async () => {
        await firstValueFrom(this.api.adjustBalance(account.id, targetBalance, description));
        await this.loadAccounts();
        if (this.selectedAccountId() === account.id) {
          await this.openTransactions(this.selectedAccount() ?? account);
        }
      },
      'Ajuste registrado no histórico.',
      'Não foi possível ajustar o saldo.',
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
