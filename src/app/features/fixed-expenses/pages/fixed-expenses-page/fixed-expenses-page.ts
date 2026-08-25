import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseForm } from '../../components/expense-form/expense-form';
import { PaymentForm, PaymentPayload } from '../../components/payment-form/payment-form';
import {
  ExpenseStatusFilter,
  FixedExpensePayload,
  MonthlyExpense,
} from '../../models/fixed-expense.models';
import { FixedExpensesStore } from '../../services/fixed-expenses-store';

@Component({
  imports: [CurrencyPipe, ExpenseForm, PaymentForm, ReactiveFormsModule],
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
}
