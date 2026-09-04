import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountsApi } from '../../../accounts/services/accounts-api';
import { FinancialAccount } from '../../../accounts/models/account.models';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { ToastService } from '../../../../shared/services/toast.service';
import { InstallmentExpenseInstallment, InstallmentPurchase } from '../../models/installment-expense.models';
import { InstallmentExpensesApi } from '../../services/installment-expenses-api';

@Component({
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, CurrencyMaskDirective],
  selector: 'app-installment-expenses-page',
  styleUrl: './installment-expenses-page.scss',
  templateUrl: './installment-expenses-page.html',
})
export class InstallmentExpensesPage {
  private readonly api = inject(InstallmentExpensesApi);
  private readonly accountsApi = inject(AccountsApi);
  private readonly toast = inject(ToastService);

  protected readonly purchases = signal<InstallmentPurchase[]>([]);
  protected readonly accounts = signal<FinancialAccount[]>([]);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly payingId = signal<string | null>(null);
  protected readonly expandedId = signal<string | null>(null);

  protected readonly activeAccounts = computed(() => this.accounts().filter((account) => account.active));
  protected readonly totalPending = computed(() =>
    this.purchases().reduce((total, purchase) => total + purchase.pendingAmount, 0),
  );

  protected readonly form = new FormGroup({
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(180)] }),
    totalAmount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    installmentCount: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(120)] }),
    firstInstallmentDate: new FormControl(this.today(), { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly paymentForm = new FormGroup({
    financialAccountId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    paymentDate: new FormControl(this.today(), { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (purchases) => {
        this.purchases.set(purchases);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Não foi possível carregar as despesas parceladas.');
        this.loading.set(false);
      },
    });
    this.accountsApi.getOverview(false).subscribe({
      next: (overview) => {
        this.accounts.set(overview.accounts);
        this.paymentForm.controls.financialAccountId.setValue(overview.accounts[0]?.id ?? '');
      },
    });
  }

  protected createPurchase(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.api.create(this.form.getRawValue()).subscribe({
      next: (purchase) => {
        this.purchases.update((items) => [purchase, ...items]);
        this.expandedId.set(purchase.id);
        this.form.reset({ description: '', totalAmount: 0, installmentCount: 2, firstInstallmentDate: this.today() });
        this.toast.success('Despesa parcelada criada.');
        this.submitting.set(false);
      },
      error: () => {
        this.toast.error('Não foi possível criar a despesa parcelada.');
        this.submitting.set(false);
      },
    });
  }

  protected togglePurchase(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  protected startPayment(installment: InstallmentExpenseInstallment): void {
    this.payingId.set(installment.id);
    this.paymentForm.reset({ financialAccountId: this.activeAccounts()[0]?.id ?? '', paymentDate: this.today() });
  }

  protected cancelPayment(): void {
    this.payingId.set(null);
  }

  protected confirmPayment(purchase: InstallmentPurchase, installment: InstallmentExpenseInstallment): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const payload = this.paymentForm.getRawValue();
    this.api.payInstallment(installment.id, payload.financialAccountId, payload.paymentDate).subscribe({
      next: (result) => {
        const updatedInstallment = result.installment;
        this.purchases.update((items) => items.map((item) => {
          if (item.id !== purchase.id) {
            return item;
          }
          const installments = item.installments.map((candidate) =>
            candidate.id === updatedInstallment.id ? updatedInstallment : candidate,
          );
          const paidAmount = installments
            .filter((candidate) => candidate.status === 'PAID')
            .reduce((total, candidate) => total + candidate.amount, 0);
          return { ...item, installments, paidAmount, pendingAmount: item.totalAmount - paidAmount };
        }));
        this.payingId.set(null);
        this.toast.success('Parcela paga com sucesso.');
        this.accountsApi.getOverview(false).subscribe((overview) => this.accounts.set(overview.accounts));
      },
      error: () => this.toast.error('Não foi possível pagar esta parcela.'),
    });
  }

  private today(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
}
