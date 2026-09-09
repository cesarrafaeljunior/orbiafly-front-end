import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import {
  ExpectedIncome,
  ExpectedIncomePayload,
  ExpectedIncomeStatus,
  EXPECTED_INCOME_STATUS_LABELS,
} from '../../models/expected-income.models';
import { ExpectedIncomesStore } from '../../services/expected-incomes-store';

type IncomeStatusFilter = 'ALL' | ExpectedIncomeStatus;
type IncomeSortOption = 'DATE_ASC' | 'DATE_DESC' | 'AMOUNT_DESC' | 'AMOUNT_ASC' | 'NAME_ASC';

@Component({
  imports: [CurrencyMaskDirective, CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule],
  providers: [ExpectedIncomesStore],
  selector: 'app-expected-incomes-page',
  styleUrl: './expected-incomes-page.scss',
  templateUrl: './expected-incomes-page.html',
})
export class ExpectedIncomesPage implements OnInit {
  protected readonly store = inject(ExpectedIncomesStore);
  protected readonly statusLabels = EXPECTED_INCOME_STATUS_LABELS;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<IncomeStatusFilter>('ALL');
  protected readonly sortOption = signal<IncomeSortOption>('DATE_ASC');
  protected readonly showIncomeForm = signal(false);
  protected readonly editingIncome = signal<ExpectedIncome | null>(null);
  protected readonly receivingIncome = signal<ExpectedIncome | null>(null);
  protected readonly cancelingIncome = signal<ExpectedIncome | null>(null);

  protected readonly incomeForm = new FormGroup({
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(160)],
    }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    expectedDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    financialAccountId: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
  });

  protected readonly receiveForm = new FormGroup({
    financialAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    receivedDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly filteredIncomes = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    const status = this.statusFilter();
    const sort = this.sortOption();
    return this.store
      .overview()
      .items.filter((income) => {
        if (status !== 'ALL' && income.status !== status) {
          return false;
        }
        if (!query) {
          return true;
        }
        return [income.description, income.financialAccountName, income.notes]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(query);
      })
      .sort((left, right) => {
        switch (sort) {
          case 'DATE_DESC':
            return new Date(right.expectedDate).getTime() - new Date(left.expectedDate).getTime();
          case 'AMOUNT_DESC':
            return right.amount - left.amount;
          case 'AMOUNT_ASC':
            return left.amount - right.amount;
          case 'NAME_ASC':
            return left.description.localeCompare(right.description, 'pt-BR');
          case 'DATE_ASC':
          default:
            return new Date(left.expectedDate).getTime() - new Date(right.expectedDate).getTime();
        }
      });
  });

  async ngOnInit(): Promise<void> {
    await this.store.initialize();
  }

  protected openCreate(): void {
    this.editingIncome.set(null);
    this.incomeForm.reset({
      description: '',
      amount: 0,
      expectedDate: this.today(),
      financialAccountId: this.store.activeAccounts()[0]?.id ?? '',
      notes: '',
    });
    this.showIncomeForm.set(true);
  }

  protected openEdit(income: ExpectedIncome): void {
    if (income.status !== 'PENDING') {
      return;
    }
    this.editingIncome.set(income);
    this.incomeForm.reset({
      description: income.description,
      amount: income.amount,
      expectedDate: income.expectedDate,
      financialAccountId: income.financialAccountId ?? '',
      notes: income.notes ?? '',
    });
    this.showIncomeForm.set(true);
  }

  protected closeIncomeForm(): void {
    this.showIncomeForm.set(false);
    this.editingIncome.set(null);
  }

  protected async saveIncome(): Promise<void> {
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      return;
    }
    const value = this.incomeForm.getRawValue();
    const payload: ExpectedIncomePayload = {
      description: value.description.trim(),
      amount: value.amount,
      expectedDate: value.expectedDate,
      financialAccountId: value.financialAccountId || null,
      notes: value.notes.trim() || null,
    };
    const editing = this.editingIncome();
    const saved = editing
      ? await this.store.update(editing, payload)
      : await this.store.create(payload);
    if (saved) {
      this.closeIncomeForm();
    }
  }

  protected openReceive(income: ExpectedIncome): void {
    this.receivingIncome.set(income);
    this.receiveForm.reset({
      financialAccountId: income.financialAccountId ?? this.store.activeAccounts()[0]?.id ?? '',
      receivedDate: this.today(),
    });
  }

  protected closeReceive(): void {
    this.receivingIncome.set(null);
  }

  protected async confirmReceive(): Promise<void> {
    const income = this.receivingIncome();
    if (!income) {
      return;
    }
    if (this.receiveForm.invalid) {
      this.receiveForm.markAllAsTouched();
      return;
    }
    const value = this.receiveForm.getRawValue();
    if (await this.store.receive(income, value)) {
      this.closeReceive();
    }
  }

  protected async confirmCancel(): Promise<void> {
    const income = this.cancelingIncome();
    if (income && (await this.store.cancel(income))) {
      this.cancelingIncome.set(null);
    }
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected changeStatusFilter(filter: IncomeStatusFilter): void {
    this.statusFilter.set(filter);
  }

  protected changeSort(event: Event): void {
    this.sortOption.set((event.target as HTMLSelectElement).value as IncomeSortOption);
  }

  protected statusLabel(status: ExpectedIncomeStatus): string {
    return this.statusLabels[status];
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
