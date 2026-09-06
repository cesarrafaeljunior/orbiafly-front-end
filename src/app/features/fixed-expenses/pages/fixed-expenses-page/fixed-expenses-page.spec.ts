import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AccountsApi } from '../../../accounts/services/accounts-api';
import { FixedExpensesApi } from '../../services/fixed-expenses-api';
import { MonthlyExpense } from '../../models/fixed-expense.models';
import { FixedExpensesPage } from './fixed-expenses-page';

registerLocaleData(localePt);

const items: MonthlyExpense[] = Array.from({ length: 14 }, (_, index) => ({
  occurrenceId: `occurrence-${index}`,
  fixedExpenseId: `expense-${index}`,
  name: `Despesa ${String(index).padStart(2, '0')}`,
  amount: 100 + index,
  defaultAmount: 100,
  dueDate: `2026-09-${String(index + 1).padStart(2, '0')}`,
  dueDay: index + 1,
  categoryId: index % 2 ? 'home' : 'other',
  category: index % 2 ? 'Casa' : 'Outros',
  status: index % 2 ? 'PAID' : 'PENDING',
  paidAt: null,
  financialAccountId: null,
  financialAccountName: null,
  overdue: index === 0,
  daysUntilDue: index,
  daysOverdue: index === 0 ? 1 : null,
  active: true,
}));

async function setup() {
  const api = {
    getCategories: vi.fn(() =>
      of([
        { id: 'home', name: 'Casa' },
        { id: 'other', name: 'Outros' },
      ]),
    ),
    getMonthly: vi.fn(() =>
      of({
        items,
        summary: {
          total: 1491,
          paidTotal: 749,
          pendingTotal: 742,
          totalCount: 14,
          paidCount: 7,
          pendingCount: 7,
          paidPercentage: 50.2,
        },
      }),
    ),
    updateStatus: vi.fn(() => of({ ...items[0], status: 'PAID' })),
  };
  await TestBed.configureTestingModule({
    imports: [FixedExpensesPage],
    providers: [
      { provide: FixedExpensesApi, useValue: api },
      { provide: AccountsApi, useValue: { getOverview: () => of({ accounts: [] }) } },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(FixedExpensesPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const element = fixture.nativeElement as HTMLElement;
  const click = async (selector: string) => {
    element.querySelector<HTMLButtonElement>(selector)!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const change = async (selector: string, value: string, event = 'change') => {
    const control = element.querySelector<HTMLInputElement>(selector)!;
    control.value = value;
    control.dispatchEvent(new Event(event));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { fixture, element, api, click, change };
}

describe('FixedExpensesPage mobile controls', () => {
  it('paginates after filtering and sorting, resets on search and keeps the monthly total', async () => {
    const { element, click, change } = await setup();
    expect(element.querySelectorAll('.expense-card')).toHaveLength(6);
    const summary = element.querySelector('.monthly-panel')!.textContent;
    await click('.list-pagination button');
    expect(element.querySelectorAll('.expense-card')).toHaveLength(12);
    await change('.search-field input', 'Casa', 'input');
    expect(element.querySelectorAll('.expense-card')).toHaveLength(6);
    expect(element.querySelector('.list-pagination')!.textContent).toContain('6 de 7');
    await change('.sort-control select', 'AMOUNT_DESC');
    expect(element.querySelector('.expense-card h2')!.textContent).toBe('Despesa 13');
    await click('.list-pagination button');
    expect(element.querySelectorAll('.expense-card')).toHaveLength(7);
    expect(element.querySelector('.list-pagination button')).toBeNull();
    await change('.category-control select', 'other');
    expect(element.textContent).toContain('Nenhuma despesa encontrada');
    await click('.empty-state button');
    expect(element.querySelectorAll('.expense-card')).toHaveLength(6);
    await click('.status-filter button:nth-child(2)');
    expect(element.querySelector('.list-pagination')!.textContent).toContain('6 de 7');
    expect(element.querySelector('.monthly-panel')!.textContent).toBe(summary);
  });

  it('selects month and year directly, keeps arrows and resets pagination', async () => {
    const { element, api, click, change, fixture } = await setup();
    await click('.list-pagination button');
    await click('.period-trigger');
    await change('.period-picker input', '2028', 'input');
    const select = element.querySelector<HTMLSelectElement>('.period-picker select')!;
    select.selectedIndex = 11;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await click('.period-picker button');
    expect(api.getMonthly).toHaveBeenLastCalledWith(2028, 12);
    expect(element.querySelectorAll('.expense-card')).toHaveLength(6);
    expect(element.querySelector('.period-picker')).toBeNull();
    await click('[aria-label="Próximo mês"]');
    expect(api.getMonthly).toHaveBeenLastCalledWith(2029, 1);
    await click('[aria-label="Mês anterior"]');
    expect(api.getMonthly).toHaveBeenLastCalledWith(2028, 12);
    await click('.period-trigger');
    await change('.period-picker input', '1999', 'input');
    expect(element.querySelector<HTMLButtonElement>('.period-picker button')!.disabled).toBe(true);
  });

  it('expands filters and secondary actions and preserves the primary payment action', async () => {
    const { element, api, click } = await setup();
    await click('.filters-toggle');
    expect(element.querySelector('.filters-toggle')!.getAttribute('aria-expanded')).toBe('true');
    await click('.status-filter button:nth-child(4)');
    expect(element.querySelector('.filters-toggle')!.textContent).toContain('(1)');
    expect(element.querySelectorAll('.expense-card')).toHaveLength(1);
    await click('.actions-toggle');
    expect(element.querySelector('.secondary-actions--expanded')).not.toBeNull();
    await click('.secondary-actions button');
    expect(element.querySelector('[role="dialog"]')!.textContent).toContain('Editar valor mensal');
    await click('[aria-label="Fechar"]');
    await click('.action-button--primary');
    expect(api.updateStatus).toHaveBeenCalledWith('occurrence-0', 'PAID');
  });
});
