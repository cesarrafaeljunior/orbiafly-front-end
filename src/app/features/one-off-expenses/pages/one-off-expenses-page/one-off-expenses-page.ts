import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OneOffExpense, OneOffExpenseFilter } from '../../models/one-off-expense.models';
import { OneOffExpensesStore } from '../../services/one-off-expenses-store';

@Component({
  selector: 'app-one-off-expenses-page',
  imports: [CurrencyMaskDirective, CurrencyPipe, DecimalPipe, ReactiveFormsModule],
  providers: [OneOffExpensesStore],
  templateUrl: './one-off-expenses-page.html',
  styleUrl: './one-off-expenses-page.scss',
})
export class OneOffExpensesPage implements OnInit {
  protected readonly store = inject(OneOffExpensesStore);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly editing = signal<OneOffExpense | null>(null);
  protected readonly paying = signal<OneOffExpense | null>(null);
  protected readonly deleting = signal<OneOffExpense | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly activeFilterCount = computed(() =>
    Number(this.store.statusFilter() !== 'ALL') + Number(this.store.categoryFilter() !== 'ALL'),
  );

  protected readonly expenseForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    expenseDate: [this.localDate(), Validators.required],
    categoryId: ['', Validators.required],
  });

  protected readonly paymentForm = this.formBuilder.nonNullable.group({
    financialAccountId: ['', Validators.required],
    paymentDate: [this.localDate(), Validators.required],
  });

  ngOnInit(): void {
    void this.store.initialize();
  }

  protected moveMonth(offset: number): void {
    void this.store.moveMonth(offset);
  }

  protected openCreate(): void {
    this.editing.set(null);
    const day = String(Math.min(new Date().getDate(), new Date(this.store.year(), this.store.month(), 0).getDate())).padStart(2, '0');
    this.expenseForm.reset({
      name: '', amount: 0,
      expenseDate: `${this.store.year()}-${String(this.store.month()).padStart(2, '0')}-${day}`,
      categoryId: this.store.categories()[0]?.id ?? '',
    });
    this.formOpen.set(true);
  }

  protected openEdit(item: OneOffExpense): void {
    this.editing.set(item);
    this.expenseForm.reset({
      name: item.name, amount: item.amount, expenseDate: item.expenseDate, categoryId: item.categoryId,
    });
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  protected async save(): Promise<void> {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }
    const payload = this.expenseForm.getRawValue();
    const item = this.editing();
    const saved = item ? await this.store.update(item, payload) : await this.store.create(payload);
    if (saved) this.closeForm();
  }

  protected changePayment(item: OneOffExpense): void {
    if (item.status === 'PENDING' && this.store.accounts().length > 0) {
      this.paying.set(item);
      this.paymentForm.reset({ financialAccountId: this.store.accounts()[0]?.id ?? '', paymentDate: this.localDate() });
      return;
    }
    void this.store.toggleStatus(item);
  }

  protected async confirmPayment(): Promise<void> {
    const item = this.paying();
    if (!item || this.paymentForm.invalid) return;
    const payment = this.paymentForm.getRawValue();
    if (await this.store.registerPayment(item, payment.financialAccountId, payment.paymentDate)) {
      this.paying.set(null);
    }
  }

  protected async confirmDelete(): Promise<void> {
    const item = this.deleting();
    if (item && await this.store.delete(item)) this.deleting.set(null);
  }

  protected setSearch(event: Event): void {
    this.store.search.set((event.target as HTMLInputElement).value);
  }

  protected setStatus(status: OneOffExpenseFilter): void {
    this.store.statusFilter.set(status);
  }

  protected setCategory(event: Event): void {
    this.store.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  protected dateLabel(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(`${value}T00:00:00Z`)).replace('.', '');
  }

  protected dateContext(item: OneOffExpense): string {
    if (item.status === 'PAID') return item.financialAccountName ?? 'Pagamento registrado';
    if (item.daysOverdue === 1) return 'Vencido há 1 dia';
    if (item.daysOverdue) return `Vencido há ${item.daysOverdue} dias`;
    if (item.daysUntilDue === 0) return 'Hoje';
    if (item.daysUntilDue === 1) return 'Amanhã';
    return `Em ${item.daysUntilDue ?? 0} dias`;
  }

  private localDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
