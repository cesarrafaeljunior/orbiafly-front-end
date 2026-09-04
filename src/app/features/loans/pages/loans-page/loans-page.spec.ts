import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AccountsApi } from '../../../accounts/services/accounts-api';
import { ToastService } from '../../../../shared/services/toast.service';
import { LoansApi } from '../../services/loans-api';
import { LoansPage } from './loans-page';

registerLocaleData(localePt);

const loan = {
  id: 'loan-1',
  name: 'Empréstimo Nubank',
  direction: 'BORROWED',
  counterparty: 'Nubank',
  totalAmount: 5000,
  startDate: '2026-08-31',
  installmentCount: 10,
  installmentAmount: 500,
  firstDueDate: '2026-09-10',
  interestRate: null,
  notes: null,
  status: 'ACTIVE',
  settledAmount: 2000,
  remainingAmount: 3000,
  progressPercentage: 40,
  completedInstallmentCount: 4,
  nextInstallment: {
    id: 'installment-5',
    installmentNumber: 5,
    amount: 500,
    dueDate: '2027-01-10',
    status: 'PENDING',
    completedAt: null,
    createdAt: '2026-08-31T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z',
  },
  estimatedEndDate: '2027-06-10',
  installments: [],
  entries: [],
  deletedAt: null,
  createdAt: '2026-08-31T00:00:00Z',
  updatedAt: '2026-08-31T00:00:00Z',
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

describe('LoansPage', () => {
  async function setup(loans: unknown[]): Promise<ComponentFixture<LoansPage>> {
    const api = {
      getOverview: vi.fn().mockReturnValue(
        of({
          totalBorrowedRemaining: loans.length ? 3000 : 0,
          totalLentRemaining: 0,
          activeLoanCount: loans.length,
          upcomingEntryCount: loans.length,
          loans,
        }),
      ),
      create: vi.fn(),
      registerEntry: vi.fn(),
      delete: vi.fn(),
    };
    const accountsApi = {
      getOverview: vi.fn().mockReturnValue(of(accountsOverview)),
    };
    const toastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoansPage],
      providers: [
        { provide: LoansApi, useValue: api },
        { provide: AccountsApi, useValue: accountsApi },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoansPage);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('shows first-use empty state without filters when there are no loans', async () => {
    const fixture = await setup([]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Nenhum empréstimo cadastrado');
    expect(element.textContent).not.toContain('Ordenar');
  });

  it('shows summary, cards and search empty state for existing loans', async () => {
    const fixture = await setup([loan]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Total que eu devo');
    expect(element.textContent).toContain('Empréstimo Nubank');
    expect(element.textContent).toContain('Registrar pagamento');

    const input = element.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'João';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Nenhum empréstimo encontrado');
    expect(element.textContent).not.toContain('Nenhum empréstimo cadastrado');
  });
});
