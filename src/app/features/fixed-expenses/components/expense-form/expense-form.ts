import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, FixedExpensePayload, MonthlyExpense } from '../../models/fixed-expense.models';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-expense-form',
  styleUrl: './expense-form.scss',
  templateUrl: './expense-form.html',
})
export class ExpenseForm {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly categories = input.required<Category[]>();
  readonly expense = input<MonthlyExpense | null>(null);
  readonly submitting = input(false);
  readonly saved = output<Required<FixedExpensePayload>>();
  readonly cancelled = output<void>();

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    defaultAmount: [0, [Validators.required, Validators.min(0)]],
    dueDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    categoryId: ['', Validators.required],
    active: true,
  });

  constructor() {
    effect(() => {
      const expense = this.expense();
      this.form.reset({
        name: expense?.name ?? '',
        defaultAmount: expense?.defaultAmount ?? 0,
        dueDay: expense?.dueDay ?? 1,
        categoryId: expense?.categoryId ?? '',
        active: expense?.active ?? true,
      });
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
