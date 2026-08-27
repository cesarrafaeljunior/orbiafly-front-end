import { CurrencyPipe } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinancialAccount } from '../../../accounts/models/account.models';
import { MonthlyExpense } from '../../models/fixed-expense.models';

export interface PaymentPayload {
  financialAccountId: string;
  paymentDate: string;
}

@Component({
  imports: [CurrencyPipe, ReactiveFormsModule],
  selector: 'app-payment-form',
  styleUrl: './payment-form.scss',
  templateUrl: './payment-form.html',
})
export class PaymentForm implements OnInit {
  readonly expense = input.required<MonthlyExpense>();
  readonly accounts = input.required<FinancialAccount[]>();
  readonly periodLabel = input.required<string>();
  readonly submitting = input(false);
  readonly confirmed = output<PaymentPayload>();
  readonly cancelled = output<void>();

  protected readonly form = new FormGroup({
    financialAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    paymentDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.form.controls.financialAccountId.setValue(this.accounts()[0]?.id ?? '');
  }

  protected selectedAccount(): FinancialAccount | null {
    const selectedId = this.form.controls.financialAccountId.value;
    return (
      this.accounts().find((account) => account.id === selectedId) ?? this.accounts()[0] ?? null
    );
  }

  protected projectedBalance(account: FinancialAccount): number {
    return Math.round((account.currentBalance - this.expense().amount) * 100) / 100;
  }

  protected submit(): void {
    if (!this.form.controls.financialAccountId.value && this.accounts()[0]) {
      this.form.controls.financialAccountId.setValue(this.accounts()[0].id);
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmed.emit(this.form.getRawValue());
  }

  private today(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
}
