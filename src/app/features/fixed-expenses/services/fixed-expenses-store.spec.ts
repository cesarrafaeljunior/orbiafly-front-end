import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MonthlyExpense } from '../models/fixed-expense.models';
import { FixedExpensesApi } from './fixed-expenses-api';
import { FixedExpensesStore } from './fixed-expenses-store';
import { AccountsApi } from '../../accounts/services/accounts-api';

const pendingExpense: MonthlyExpense = {
  occurrenceId: 'occurrence-1',
  fixedExpenseId: 'expense-1',
  name: 'Energia',
  amount: 247.82,
  defaultAmount: 200,
  dueDay: 18,
  categoryId: 'category-home',
  category: 'Casa',
  status: 'PENDING',
  paidAt: null,
  financialAccountId: null,
  financialAccountName: null,
  active: true,
};

const paidExpense: MonthlyExpense = {
  ...pendingExpense,
  occurrenceId: 'occurrence-2',
  fixedExpenseId: 'expense-2',
  name: 'Spotify',
  amount: 31.9,
  categoryId: 'category-subscriptions',
  category: 'Assinaturas',
  status: 'PAID',
  paidAt: '2026-08-10T10:00:00Z',
};

describe('FixedExpensesStore', () => {
  const api = {
    create: vi.fn(),
    getCategories: vi.fn(),
    getMonthly: vi.fn(),
    update: vi.fn(),
    updateAmount: vi.fn(),
    updateStatus: vi.fn(),
    registerPayment: vi.fn(),
  };
  const accountsApi = {
    getOverview: vi.fn(),
  };
  let store: FixedExpensesStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getCategories.mockReturnValue(
      of([
        { id: 'category-home', name: 'Casa' },
        { id: 'category-subscriptions', name: 'Assinaturas' },
      ]),
    );
    accountsApi.getOverview.mockReturnValue(
      of({
        totalAvailableBalance: 250,
        activeCount: 1,
        accounts: [
          {
            id: 'account-1',
            name: 'Conta principal',
            type: 'CHECKING',
            institution: 'Banco',
            openingBalance: 250,
            currentBalance: 250,
            active: true,
            createdAt: '2026-08-01T00:00:00Z',
            updatedAt: '2026-08-01T00:00:00Z',
          },
        ],
      }),
    );
    api.getMonthly.mockReturnValue(
      of({
        year: 2026,
        month: 8,
        items: [pendingExpense, paidExpense],
        summary: {
          total: 279.72,
          paidTotal: 31.9,
          pendingTotal: 247.82,
          paidCount: 1,
          pendingCount: 1,
        },
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        FixedExpensesStore,
        { provide: FixedExpensesApi, useValue: api },
        { provide: AccountsApi, useValue: accountsApi },
      ],
    });
    store = TestBed.inject(FixedExpensesStore);
    store.year.set(2026);
    store.month.set(8);
  });

  it('loads the selected month and calculates totals in cents', async () => {
    await store.initialize();

    expect(store.loading()).toBe(false);
    expect(store.items()).toHaveLength(2);
    expect(store.summary()).toEqual({
      total: 279.72,
      paidTotal: 31.9,
      pendingTotal: 247.82,
      paidCount: 1,
      pendingCount: 1,
    });
    expect(store.periodLabel()).toBe('Agosto de 2026');
  });

  it('filters by status, category and text without another API request', async () => {
    await store.initialize();
    api.getMonthly.mockClear();

    store.statusFilter.set('PENDING');
    expect(store.filteredItems().map((item) => item.name)).toEqual(['Energia']);

    store.statusFilter.set('ALL');
    store.categoryFilter.set('category-subscriptions');
    expect(store.filteredItems().map((item) => item.name)).toEqual(['Spotify']);

    store.categoryFilter.set('ALL');
    store.search.set('ener');
    expect(store.filteredItems().map((item) => item.name)).toEqual(['Energia']);
    expect(api.getMonthly).not.toHaveBeenCalled();
  });

  it('loads the next competence without resetting data locally', async () => {
    await store.moveMonth(1);

    expect(store.year()).toBe(2026);
    expect(store.month()).toBe(9);
    expect(api.getMonthly).toHaveBeenCalledWith(2026, 9);
  });

  it('updates payment status and rolls back when the API fails', async () => {
    store.items.set([pendingExpense]);
    api.updateStatus.mockReturnValue(
      of({ ...pendingExpense, status: 'PAID', paidAt: '2026-08-10T10:00:00Z' }),
    );

    await store.toggleStatus(pendingExpense);
    expect(store.items()[0].status).toBe('PAID');
    expect(store.summary().paidTotal).toBe(247.82);

    const paid = store.items()[0];
    api.updateStatus.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { detail: 'Falha simulada.' },
          }),
      ),
    );

    await store.toggleStatus(paid);
    expect(store.items()[0].status).toBe('PAID');
    expect(store.error()).toBe('Falha simulada.');
  });

  it('registers a payment against an account and exposes a negative balance warning', async () => {
    await store.initialize();
    api.registerPayment.mockReturnValue(
      of({
        occurrence: {
          ...pendingExpense,
          status: 'PAID',
          paidAt: '2026-08-18T12:00:00Z',
          financialAccountId: 'account-1',
          financialAccountName: 'Conta principal',
        },
        payment: {
          id: 'transaction-1',
          balanceEffect: -247.82,
          occurredOn: '2026-08-18',
        },
        financialAccount: {
          id: 'account-1',
          name: 'Conta principal',
          currentBalance: 2.18,
          active: true,
        },
        updatedBalance: -10,
        negativeBalance: true,
      }),
    );

    const succeeded = await store.registerPayment(pendingExpense, 'account-1', '2026-08-18');

    expect(succeeded).toBe(true);
    expect(api.registerPayment).toHaveBeenCalledWith('occurrence-1', 'account-1', '2026-08-18');
    expect(store.items()[0].financialAccountName).toBe('Conta principal');
    expect(store.accounts()[0].currentBalance).toBe(-10);
    expect(store.notice()).toContain('saldo negativo');
  });

  it('exposes a useful error when the monthly request fails', async () => {
    api.getMonthly.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 503, error: { detail: 'Serviço indisponível.' } }),
      ),
    );

    await store.loadMonth();

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Serviço indisponível.');
  });
});
