import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialAccount } from '../models/account.models';
import { ToastService } from '../../../shared/services/toast.service';
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
    reactivate: vi.fn(),
    delete: vi.fn(),
    getTransactions: vi.fn(),
    adjustBalance: vi.fn(),
  };
  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  let store: AccountsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(
      of({ totalAvailableBalance: 750, activeCount: 1, accounts: [account] }),
    );
    api.getTransactions.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        AccountsStore,
        { provide: AccountsApi, useValue: api },
        { provide: ToastService, useValue: toastService },
      ],
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
    expect(toastService.success).toHaveBeenCalledWith('Ajuste registrado no histórico.');
  });

  it('requests inactive accounts without discarding their history', async () => {
    await store.setIncludeInactive(true);
    await store.openTransactions({ ...account, active: false });

    expect(api.getOverview).toHaveBeenCalledWith(true);
    expect(api.getTransactions).toHaveBeenCalledWith('account-1');
  });

  it('reactivates an account preserving its history', async () => {
    api.reactivate.mockReturnValue(of({ ...account, active: true }));
    await store.initialize();

    const succeeded = await store.reactivate({ ...account, active: false });

    expect(succeeded).toBe(true);
    expect(api.reactivate).toHaveBeenCalledWith('account-1');
    expect(api.getOverview).toHaveBeenCalledTimes(2);
    expect(toastService.success).toHaveBeenCalledWith(
      'Conta reativada. O histórico foi preservado.',
    );
  });

  it('deletes an inactive account and closes its transaction panel', async () => {
    api.delete.mockReturnValue(of(undefined));
    await store.initialize();
    await store.openTransactions(account);

    const succeeded = await store.delete({ ...account, active: false });

    expect(succeeded).toBe(true);
    expect(api.delete).toHaveBeenCalledWith('account-1');
    expect(store.selectedAccountId()).toBeNull();
    expect(store.transactions()).toEqual([]);
    expect(toastService.success).toHaveBeenCalledWith('Conta excluída definitivamente.');
  });
});
