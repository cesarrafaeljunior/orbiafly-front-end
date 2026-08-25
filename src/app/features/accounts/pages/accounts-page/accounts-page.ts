import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ACCOUNT_TYPE_LABELS,
  FinancialAccount,
  FinancialAccountPayload,
  FinancialAccountType,
} from '../../models/account.models';
import { AccountsStore } from '../../services/accounts-store';

@Component({
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  providers: [AccountsStore],
  selector: 'app-accounts-page',
  styleUrl: './accounts-page.scss',
  templateUrl: './accounts-page.html',
})
export class AccountsPage implements OnInit {
  protected readonly store = inject(AccountsStore);
  protected readonly typeLabels = ACCOUNT_TYPE_LABELS;
  protected readonly accountTypes = Object.keys(ACCOUNT_TYPE_LABELS) as FinancialAccountType[];
  protected readonly showAccountForm = signal(false);
  protected readonly editingAccount = signal<FinancialAccount | null>(null);
  protected readonly adjustingAccount = signal<FinancialAccount | null>(null);
  protected readonly deactivatingAccount = signal<FinancialAccount | null>(null);

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

  ngOnInit(): void {
    void this.store.initialize();
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

  protected openAdjustment(account: FinancialAccount): void {
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
    }
  }

  protected toggleInactive(event: Event): void {
    void this.store.setIncludeInactive((event.target as HTMLInputElement).checked);
  }

  protected transactionLabel(type: string): string {
    if (type === 'DEBIT') {
      return 'Débito';
    }
    if (type === 'CREDIT') {
      return 'Crédito';
    }
    return 'Ajuste';
  }
}
