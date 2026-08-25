import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialAccount } from '../models/account.models';
import { AccountsApi } from './accounts-api';
import { AccountsStore } from './accounts-store';

const account: FinancialAccount = {
  id: 'account-1',
  name: 'Conta principal',
  type: 'CHECKING',
  institution: 'Banco',
  openingBalance: 1000,
  currentBalance: 750,
  active: true,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

describe('AccountsStore', () => {
  const api = {
    getOverview: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    getTransactions: vi.fn(),
    adjustBalance: vi.fn(),
  };
  let store: AccountsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(
      of({ totalAvailableBalance: 750, activeCount: 1, accounts: [account] }),
    );
    api.getTransactions.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [AccountsStore, { provide: AccountsApi, useValue: api }],
    });
    store = TestBed.inject(AccountsStore);
  });

  it('loads the backend-derived available balance', async () => {
    await store.initialize();

    expect(store.overview().totalAvailableBalance).toBe(750);
    expect(store.overview().accounts[0].currentBalance).toBe(750);
  });

  it('reloads balances and history after a manual adjustment', async () => {
    api.adjustBalance.mockReturnValue(
      of({ financialAccount: account, transaction: { id: 'adjustment-1' } }),
    );
    await store.initialize();
    await store.openTransactions(account);

    const succeeded = await store.adjust(account, 700, 'Conferência do extrato');

    expect(succeeded).toBe(true);
    expect(api.adjustBalance).toHaveBeenCalledWith('account-1', 700, 'Conferência do extrato');
    expect(api.getOverview).toHaveBeenCalledTimes(2);
    expect(api.getTransactions).toHaveBeenCalledTimes(2);
  });

  it('requests inactive accounts without discarding their history', async () => {
    await store.setIncludeInactive(true);
    await store.openTransactions({ ...account, active: false });

    expect(api.getOverview).toHaveBeenCalledWith(true);
    expect(api.getTransactions).toHaveBeenCalledWith('account-1');
  });
});
