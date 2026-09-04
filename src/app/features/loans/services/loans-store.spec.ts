import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountsApi } from '../../accounts/services/accounts-api';
import { ToastService } from '../../../shared/services/toast.service';
import { LoansApi } from './loans-api';
import { LoansStore } from './loans-store';

const overview = {
  totalBorrowedRemaining: 3000,
  totalLentRemaining: 600,
  activeLoanCount: 2,
  upcomingEntryCount: 1,
  loans: [],
};

const accountsOverview = {
  totalAvailableBalance: 5000,
  activeCount: 1,
  accounts: [
    {
      id: 'account-1',
      name: 'Conta Caixa',
      type: 'CHECKING',
      institution: 'Caixa',
      openingBalance: 5000,
      currentBalance: 5000,
      active: true,
      createdAt: '2026-08-31T00:00:00Z',
      updatedAt: '2026-08-31T00:00:00Z',
    },
  ],
};

describe('LoansStore', () => {
  const api = {
    getOverview: vi.fn(),
    create: vi.fn(),
    registerEntry: vi.fn(),
    delete: vi.fn(),
  };
  const accountsApi = {
    getOverview: vi.fn(),
  };
  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  let store: LoansStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(of(overview));
    accountsApi.getOverview.mockReturnValue(of(accountsOverview));
    TestBed.configureTestingModule({
      providers: [
        LoansStore,
        { provide: LoansApi, useValue: api },
        { provide: AccountsApi, useValue: accountsApi },
        { provide: ToastService, useValue: toastService },
      ],
    });
    store = TestBed.inject(LoansStore);
  });

  it('loads loans and active accounts', async () => {
    await store.initialize();

    expect(api.getOverview).toHaveBeenCalled();
    expect(accountsApi.getOverview).toHaveBeenCalledWith(false);
    expect(store.overview()).toEqual(overview);
    expect(store.activeAccounts()).toEqual(accountsOverview.accounts);
  });

  it('creates and registers entries using the global toast', async () => {
    api.create.mockReturnValue(of({}));
    api.registerEntry.mockReturnValue(of({}));

    await expect(
      store.create({
        name: 'Empréstimo Nubank',
        direction: 'BORROWED',
        counterparty: 'Nubank',
        totalAmount: 1000,
        startDate: '2026-08-31',
      }),
    ).resolves.toBe(true);
    await expect(
      store.registerEntry('loan-1', {
        financialAccountId: 'account-1',
        amount: 100,
        occurredOn: '2026-09-10',
      }),
    ).resolves.toBe(true);

    expect(toastService.success).toHaveBeenCalledWith('Empréstimo cadastrado com sucesso.');
    expect(toastService.success).toHaveBeenCalledWith('Lançamento registrado com sucesso.');
  });

  it('shows API error details without local toast implementation', async () => {
    api.registerEntry.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { detail: 'Conta desativada.' },
          }),
      ),
    );

    await expect(
      store.registerEntry('loan-1', {
        financialAccountId: 'account-1',
        amount: 100,
        occurredOn: '2026-09-10',
      }),
    ).resolves.toBe(false);

    expect(toastService.error).toHaveBeenCalledWith('Conta desativada.');
  });
});
