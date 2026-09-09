import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ACCOUNT_TYPE_LABELS,
  AccountTransferPayload,
  FinancialAccount,
  FinancialAccountPayload,
  FinancialAccountType,
} from '../../models/account.models';
import { AccountsStore } from '../../services/accounts-store';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';

type AccountStatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

type AccountSortOption = 'NAME_ASC' | 'NAME_DESC' | 'BALANCE_DESC' | 'BALANCE_ASC';
@Component({
  imports: [CurrencyMaskDirective, CurrencyPipe, DatePipe, ReactiveFormsModule],
  providers: [AccountsStore],
  selector: 'app-accounts-page',
  styleUrl: './accounts-page.scss',
  templateUrl: './accounts-page.html',
})
export class AccountsPage implements OnInit {
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<AccountStatusFilter>('ACTIVE');
  protected readonly sortOption = signal<AccountSortOption>('NAME_ASC');
  protected readonly store = inject(AccountsStore);
  protected readonly typeLabels = ACCOUNT_TYPE_LABELS;
  protected readonly accountTypes = Object.keys(ACCOUNT_TYPE_LABELS) as FinancialAccountType[];
  protected readonly showAccountForm = signal(false);
  protected readonly editingAccount = signal<FinancialAccount | null>(null);
  protected readonly adjustingAccount = signal<FinancialAccount | null>(null);
  protected readonly deactivatingAccount = signal<FinancialAccount | null>(null);
  protected readonly deletingAccount = signal<FinancialAccount | null>(null);
  protected readonly showTransferForm = signal(false);

  protected readonly activeAccounts = computed(() =>
    this.store.overview().accounts.filter((account) => account.active),
  );

  protected readonly transferDestinationAccounts = computed(() => {
    const sourceId = this.transferForm.controls.sourceAccountId.value;
    return this.activeAccounts().filter((account) => account.id !== sourceId);
  });

  protected readonly transferSourceAccount = computed(
    () =>
      this.activeAccounts().find(
        (account) => account.id === this.transferForm.controls.sourceAccountId.value,
      ) ?? null,
  );

  protected readonly transferDestinationAccount = computed(
    () =>
      this.activeAccounts().find(
        (account) => account.id === this.transferForm.controls.destinationAccountId.value,
      ) ?? null,
  );

  protected readonly filteredAccounts = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('pt-BR');

    const status = this.statusFilter();
    const sort = this.sortOption();

    const accounts = this.store
      .overview()
      .accounts.filter((account) => {
        if (status === 'ACTIVE' && !account.active) {
          return false;
        }

        if (status === 'INACTIVE' && account.active) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchable = [account.name, account.institution, this.typeLabels[account.type]]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pt-BR');

        return searchable.includes(query);
      })
      .sort((left, right) => {
        switch (sort) {
          case 'NAME_DESC':
            return right.name.localeCompare(left.name, 'pt-BR');

          case 'BALANCE_DESC':
            return right.currentBalance - left.currentBalance;

          case 'BALANCE_ASC':
            return left.currentBalance - right.currentBalance;

          case 'NAME_ASC':
          default:
            return left.name.localeCompare(right.name, 'pt-BR');
        }
      });

    return accounts;
  });
  protected readonly hasOnlyInactiveAccounts = computed(
    () =>
      this.store.includeInactive() &&
      this.store.overview().accounts.length > 0 &&
      this.store.overview().activeCount === 0,
  );

  protected readonly accountForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    institution: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(120)],
    }),
    type: new FormControl<FinancialAccountType>('CHECKING', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    openingBalance: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly transferForm = new FormGroup({
    sourceAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    destinationAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    transferDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(180)],
    }),
  });

  protected readonly adjustmentForm = new FormGroup({
    targetBalance: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(180)],
    }),
  });

  async ngOnInit(): Promise<void> {
    await this.store.initialize();
    await this.ensureInactiveAccountsAreVisible();
  }

  protected openCreate(): void {
    this.editingAccount.set(null);
    this.accountForm.reset({
      name: '',
      institution: '',
      type: 'CHECKING',
      openingBalance: 0,
    });
    this.showAccountForm.set(true);
  }

  protected openEdit(account: FinancialAccount): void {
    if (!account.active) {
      return;
    }
    this.editingAccount.set(account);
    this.accountForm.reset({
      name: account.name,
      institution: account.institution ?? '',
      type: account.type,
      openingBalance: account.openingBalance,
    });
    this.showAccountForm.set(true);
  }

  protected closeAccountForm(): void {
    this.showAccountForm.set(false);
    this.editingAccount.set(null);
  }

  protected async saveAccount(): Promise<void> {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    const value = this.accountForm.getRawValue();
    const payload: FinancialAccountPayload = {
      name: value.name,
      institution: value.institution,
      type: value.type,
    };
    const editing = this.editingAccount();
    const success = editing
      ? await this.store.update(editing, payload)
      : await this.store.create({ ...payload, openingBalance: value.openingBalance });
    if (success) {
      this.closeAccountForm();
    }
  }

  protected openTransfer(source?: FinancialAccount): void {
    const accounts = this.activeAccounts();
    const sourceAccount = source ?? accounts[0] ?? null;
    const destinationAccount = accounts.find((account) => account.id !== sourceAccount?.id) ?? null;
    this.transferForm.reset({
      sourceAccountId: sourceAccount?.id ?? '',
      destinationAccountId: destinationAccount?.id ?? '',
      amount: 0,
      transferDate: this.today(),
      description: '',
    });
    this.showTransferForm.set(true);
  }

  protected closeTransferForm(): void {
    this.showTransferForm.set(false);
  }

  protected onTransferSourceChange(): void {
    const destination = this.transferDestinationAccount();
    if (!destination) {
      this.transferForm.controls.destinationAccountId.setValue(
        this.transferDestinationAccounts()[0]?.id ?? '',
      );
    }
  }

  protected transferSourceBalanceAfter(): number {
    const account = this.transferSourceAccount();
    return account ? account.currentBalance - this.transferForm.controls.amount.value : 0;
  }

  protected transferDestinationBalanceAfter(): number {
    const account = this.transferDestinationAccount();
    return account ? account.currentBalance + this.transferForm.controls.amount.value : 0;
  }

  protected async saveTransfer(): Promise<void> {
    const value = this.transferForm.getRawValue();
    if (this.transferForm.invalid || value.sourceAccountId === value.destinationAccountId) {
      this.transferForm.markAllAsTouched();
      return;
    }
    const payload: AccountTransferPayload = {
      sourceAccountId: value.sourceAccountId,
      destinationAccountId: value.destinationAccountId,
      amount: value.amount,
      transferDate: value.transferDate,
      description: value.description.trim() || null,
    };
    if (await this.store.transfer(payload)) {
      this.closeTransferForm();
    }
  }

  protected openAdjustment(account: FinancialAccount): void {
    if (!account.active) {
      return;
    }
    this.adjustingAccount.set(account);
    this.adjustmentForm.reset({
      targetBalance: account.currentBalance,
      description: '',
    });
  }

  protected closeAdjustment(): void {
    this.adjustingAccount.set(null);
  }

  protected adjustmentDifference(): number {
    const account = this.adjustingAccount();
    return account ? this.adjustmentForm.controls.targetBalance.value - account.currentBalance : 0;
  }

  protected async saveAdjustment(): Promise<void> {
    const account = this.adjustingAccount();
    if (!account || this.adjustmentForm.invalid || this.adjustmentDifference() === 0) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }
    const value = this.adjustmentForm.getRawValue();
    if (await this.store.adjust(account, value.targetBalance, value.description)) {
      this.closeAdjustment();
    }
  }

  protected async confirmDeactivation(): Promise<void> {
    const account = this.deactivatingAccount();
    if (account && (await this.store.deactivate(account))) {
      this.deactivatingAccount.set(null);
      await this.ensureInactiveAccountsAreVisible();
    }
  }

  protected async confirmDeletion(): Promise<void> {
    const account = this.deletingAccount();
    if (account && (await this.store.delete(account))) {
      this.deletingAccount.set(null);
    }
  }

  protected updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected async changeStatusFilter(filter: AccountStatusFilter): Promise<void> {
    if (filter === 'ACTIVE' && this.hasOnlyInactiveAccounts()) {
      return;
    }

    this.statusFilter.set(filter);

    // ACTIVE pode continuar usando apenas as contas ativas.
    // INACTIVE/ALL precisam pedir ao backend também as contas inativas.
    await this.store.setIncludeInactive(filter !== 'ACTIVE');
  }

  protected changeSort(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortOption.set(target.value as AccountSortOption);
  }

  protected transactionLabel(type: string): string {
    if (type === 'DEBIT') {
      return 'Débito';
    }
    if (type === 'CREDIT') {
      return 'Crédito';
    }
    if (type === 'TRANSFER_IN') {
      return 'Transferência recebida';
    }
    if (type === 'TRANSFER_OUT') {
      return 'Transferência enviada';
    }
    return 'Ajuste';
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private async ensureInactiveAccountsAreVisible(): Promise<void> {
    if (this.store.overview().accounts.length > 0 || this.store.includeInactive()) {
      return;
    }

    await this.store.setIncludeInactive(true);

    if (this.store.overview().accounts.length > 0 && this.store.overview().activeCount === 0) {
      this.statusFilter.set('INACTIVE');
    }
  }
}
