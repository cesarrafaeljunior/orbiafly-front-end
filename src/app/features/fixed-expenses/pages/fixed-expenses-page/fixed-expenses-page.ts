import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { ExpenseForm } from '../../components/expense-form/expense-form';
import { PaymentForm, PaymentPayload } from '../../components/payment-form/payment-form';
import {
  ExpenseSortOption,
  ExpenseStatusFilter,
  FixedExpensePayload,
  MonthlyExpense,
} from '../../models/fixed-expense.models';
import { FixedExpensesStore } from '../../services/fixed-expenses-store';

@Component({
  imports: [
    CurrencyMaskDirective,
    CurrencyPipe,
    DecimalPipe,
    ExpenseForm,
    PaymentForm,
    ReactiveFormsModule,
  ],
  providers: [FixedExpensesStore],
  selector: 'app-fixed-expenses-page',
  styleUrl: './fixed-expenses-page.scss',
  templateUrl: './fixed-expenses-page.html',
})
export class FixedExpensesPage implements OnInit {
  protected readonly store = inject(FixedExpensesStore);
  protected readonly showExpenseForm = signal(false);
  protected readonly editingExpense = signal<MonthlyExpense | null>(null);
  protected readonly monthlyExpense = signal<MonthlyExpense | null>(null);
  protected readonly payingExpense = signal<MonthlyExpense | null>(null);
  protected readonly monthlyAmount = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0)],
  });
  protected readonly sortOptions: { value: ExpenseSortOption; label: string }[] = [
    { value: 'DUE_ASC', label: 'Vencimento mais próximo' },
    { value: 'DUE_DESC', label: 'Vencimento mais distante' },
    { value: 'AMOUNT_DESC', label: 'Maior valor' },
    { value: 'AMOUNT_ASC', label: 'Menor valor' },
    { value: 'NAME_ASC', label: 'Nome A-Z' },
    { value: 'NAME_DESC', label: 'Nome Z-A' },
  ];

  ngOnInit(): void {
    void this.store.initialize();
  }

  protected openCreate(): void {
    this.editingExpense.set(null);
    this.showExpenseForm.set(true);
  }

  protected openEdit(item: MonthlyExpense): void {
    this.editingExpense.set(item);
    this.showExpenseForm.set(true);
  }

  protected closeExpenseForm(): void {
    this.showExpenseForm.set(false);
    this.editingExpense.set(null);
  }

  protected async saveExpense(payload: Required<FixedExpensePayload>): Promise<void> {
    const editing = this.editingExpense();
    const success = editing
      ? await this.store.update(editing, payload)
      : await this.store.create({
          name: payload.name,
          defaultAmount: payload.defaultAmount,
          dueDay: payload.dueDay,
          categoryId: payload.categoryId,
        });
    if (success) {
      this.closeExpenseForm();
    }
  }

  protected openMonthlyEdit(item: MonthlyExpense): void {
    this.monthlyExpense.set(item);
    this.monthlyAmount.setValue(item.amount);
  }

  protected closeMonthlyEdit(): void {
    this.monthlyExpense.set(null);
    this.monthlyAmount.reset(0);
  }

  protected async saveMonthlyAmount(): Promise<void> {
    const item = this.monthlyExpense();
    if (!item || this.monthlyAmount.invalid) {
      this.monthlyAmount.markAsTouched();
      return;
    }
    if (await this.store.updateAmount(item, this.monthlyAmount.value)) {
      this.closeMonthlyEdit();
    }
  }

  protected setStatusFilter(filter: ExpenseStatusFilter): void {
    this.store.statusFilter.set(filter);
  }

  protected setSearch(event: Event): void {
    this.store.search.set((event.target as HTMLInputElement).value);
  }

  protected setCategory(event: Event): void {
    this.store.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  protected setSort(event: Event): void {
    this.store.sortOption.set((event.target as HTMLSelectElement).value as ExpenseSortOption);
  }

  protected changePayment(item: MonthlyExpense): void {
    if (item.status === 'PENDING' && this.store.accounts().length > 0) {
      this.payingExpense.set(item);
      return;
    }
    void this.store.toggleStatus(item);
  }

  protected closePayment(): void {
    this.payingExpense.set(null);
  }

  protected async confirmPayment(payload: PaymentPayload): Promise<void> {
    const item = this.payingExpense();
    if (!item) {
      return;
    }
    if (await this.store.registerPayment(item, payload.financialAccountId, payload.paymentDate)) {
      this.closePayment();
    }
  }

  protected dueBadge(item: MonthlyExpense): string {
    return this.formatDayMonth(new Date(`${item.dueDate}T00:00:00Z`));
  }

  protected paymentDateLabel(item: MonthlyExpense): string {
    if (!item.paidAt) {
      return 'Pagamento registrado';
    }
    return `Pago em ${this.formatDayMonth(new Date(item.paidAt))}`;
  }

  protected dueContext(item: MonthlyExpense): string {
    if (item.status === 'PAID') {
      return this.paymentDateLabel(item);
    }
    if (item.daysOverdue) {
      return item.daysOverdue === 1 ? 'Vencida há 1 dia' : `Vencida há ${item.daysOverdue} dias`;
    }
    if (item.daysUntilDue === 0) {
      return 'Vence hoje';
    }
    if (item.daysUntilDue === 1) {
      return 'Vence amanhã';
    }
    return `Vence em ${item.daysUntilDue ?? 0} dias`;
  }

  protected dueTone(item: MonthlyExpense): 'success' | 'warning' | 'error' | 'neutral' {
    if (item.status === 'PAID') {
      return 'success';
    }
    if (item.overdue) {
      return 'error';
    }
    if ((item.daysUntilDue ?? 99) <= 5) {
      return 'warning';
    }
    return 'neutral';
  }

  protected statusLabel(item: MonthlyExpense): string {
    if (item.status === 'PAID') {
      return 'Pago';
    }
    return item.overdue ? 'Vencida' : 'Pendente';
  }

  private formatDayMonth(date: Date): string {
    const day = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      timeZone: 'UTC',
    }).format(date);
    const month = new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      timeZone: 'UTC',
    })
      .format(date)
      .replace('.', '')
      .toUpperCase();

    return `${day} ${month}`;
  }
}
