import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../../shared/services/toast.service';
import { FinancialAccount } from '../../models/account.models';
import { AccountsApi } from '../../services/accounts-api';
import { AccountsPage } from './accounts-page';

registerLocaleData(localePt);

const inactiveAccount: FinancialAccount = {
  id: 'account-1',
  name: 'Conta arquivada',
  type: 'CHECKING',
  institution: 'Banco',
  openingBalance: 1000,
  currentBalance: 850,
  active: false,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-20T00:00:00Z',
};

describe('AccountsPage', () => {
  async function setup(
    responses: unknown[],
  ): Promise<{ fixture: ComponentFixture<AccountsPage>; api: { getOverview: ReturnType<typeof vi.fn> } }> {
    const api = {
      getOverview: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      reactivate: vi.fn(),
      delete: vi.fn(),
      getTransactions: vi.fn().mockReturnValue(of([])),
      adjustBalance: vi.fn(),
    };
    responses.forEach((response) => api.getOverview.mockReturnValueOnce(of(response)));
    const toastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AccountsPage],
      providers: [
        { provide: AccountsApi, useValue: api },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AccountsPage);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, api };
  }

  it('shows inactive accounts instead of the real empty state when every account is inactive', async () => {
    const { fixture, api } = await setup([
      { totalAvailableBalance: 0, activeCount: 0, accounts: [] },
      { totalAvailableBalance: 0, activeCount: 0, accounts: [inactiveAccount] },
    ]);
    const element = fixture.nativeElement as HTMLElement;

    expect(api.getOverview).toHaveBeenNthCalledWith(1, false);
    expect(api.getOverview).toHaveBeenNthCalledWith(2, true);
    expect(element.textContent).toContain('Conta arquivada');
    expect(element.textContent).toContain('Inativa');
    expect(element.textContent).not.toContain('Nenhuma conta cadastrada');
  });

  it('does not allow switching to active accounts when every account is inactive', async () => {
    const { fixture, api } = await setup([
      { totalAvailableBalance: 0, activeCount: 0, accounts: [] },
      { totalAvailableBalance: 0, activeCount: 0, accounts: [inactiveAccount] },
    ]);
    const element = fixture.nativeElement as HTMLElement;
    const activeFilter = Array.from(element.querySelectorAll<HTMLButtonElement>('.status-filter button')).find(
      (button) => button.textContent?.includes('Ativas'),
    );

    expect(activeFilter?.disabled).toBe(true);
    const callsBeforeClick = api.getOverview.mock.calls.length;

    activeFilter?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.getOverview).toHaveBeenCalledTimes(callsBeforeClick);
    expect(element.textContent).toContain('Conta arquivada');
    expect(element.textContent).not.toContain('Nenhuma conta cadastrada');
  });

  it('shows the real empty state only when no accounts exist', async () => {
    const { fixture } = await setup([
      { totalAvailableBalance: 0, activeCount: 0, accounts: [] },
      { totalAvailableBalance: 0, activeCount: 0, accounts: [] },
    ]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Nenhuma conta cadastrada');
    expect(element.textContent).toContain('Cadastre sua primeira conta');
  });
});
