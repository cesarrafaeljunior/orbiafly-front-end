import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { FinancialAccount } from '../../../accounts/models/account.models';
import { MonthlyExpense } from '../../models/fixed-expense.models';
import { PaymentForm } from './payment-form';

registerLocaleData(localePt);

const expense: MonthlyExpense = {
  occurrenceId: 'occurrence-1',
  fixedExpenseId: 'expense-1',
  name: 'Aluguel',
  amount: 900,
  defaultAmount: 900,
  dueDay: 5,
  categoryId: 'category-1',
  category: 'Moradia',
  status: 'PENDING',
  paidAt: null,
  financialAccountId: null,
  financialAccountName: null,
  active: true,
};

const account: FinancialAccount = {
  id: 'account-1',
  name: 'Caixa',
  type: 'CASH',
  institution: null,
  openingBalance: 500,
  currentBalance: 500,
  active: true,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

describe('PaymentForm', () => {
  async function setup(): Promise<ComponentFixture<PaymentForm>> {
    await TestBed.configureTestingModule({ imports: [PaymentForm] }).compileComponents();
    const fixture = TestBed.createComponent(PaymentForm);
    fixture.componentRef.setInput('expense', expense);
    fixture.componentRef.setInput('accounts', [account]);
    fixture.componentRef.setInput('periodLabel', 'Agosto de 2026');
    fixture.detectChanges();
    return fixture;
  }

  it('shows the selected balance and warns without blocking a negative result', async () => {
    const fixture = await setup();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Caixa');
    expect(element.textContent).toContain('R$ 500,00');
    expect(element.textContent).toContain('saldo negativo');
    expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(false);
  });

  it('emits the account and payment date on confirmation', async () => {
    const fixture = await setup();
    const confirmed = vi.fn();
    const element = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.confirmed.subscribe(confirmed);

    element.querySelector<HTMLFormElement>('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(confirmed).toHaveBeenCalledWith(
      expect.objectContaining({ financialAccountId: 'account-1' }),
    );
  });
});
