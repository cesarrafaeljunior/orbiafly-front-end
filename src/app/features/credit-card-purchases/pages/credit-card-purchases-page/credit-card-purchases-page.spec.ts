import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AccountsApi } from '../../../accounts/services/accounts-api';
import { CreditCardsApi } from '../../../credit-cards/services/credit-cards-api';
import { ToastService } from '../../../../shared/services/toast.service';
import { CreditCardPurchasesApi } from '../../services/credit-card-purchases-api';
import { CreditCardPurchasesPage } from './credit-card-purchases-page';

registerLocaleData(localePt);

const purchase = {
  installmentId: 'installment-1',
  purchaseId: 'purchase-1',
  description: 'Notebook',
  amount: 300,
  totalAmount: 3000,
  purchaseDate: '2026-08-01',
  installmentNumber: 1,
  installmentCount: 10,
  creditCardId: 'card-1',
  creditCardName: 'Nubank',
  creditCardBrand: 'MASTERCARD',
  creditCardLastFourDigits: '1234',
  competenceYear: 2026,
  competenceMonth: 9,
  dueDate: '2026-09-10',
  status: 'PENDING',
  paidAt: null,
  paidInstallmentCount: 0,
  pendingInstallmentCount: 10,
  remainingInstallmentCount: 9,
  endingYear: 2027,
  endingMonth: 6,
  monthsUntilEnd: 9,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const accountOverview = {
  totalAvailableBalance: 1000,
  activeCount: 1,
  accounts: [
    {
      id: 'account-1',
      name: 'Conta principal',
      type: 'CHECKING',
      institution: 'Banco',
      openingBalance: 1000,
      currentBalance: 1000,
      active: true,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
  ],
};

const cardOverview = {
  totalLimit: 5000,
  usedLimit: 3000,
  availableLimit: 2000,
  activeCount: 1,
  cards: [
    {
      id: 'card-1',
      name: 'Nubank',
      brand: 'MASTERCARD',
      lastFourDigits: '1234',
      totalLimit: 5000,
      usedLimit: 3000,
      availableLimit: 2000,
      closingDay: 3,
      dueDay: 10,
      active: true,
      deletedAt: null,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    },
  ],
};

describe('CreditCardPurchasesPage', () => {
  async function setup(purchases: unknown[]): Promise<ComponentFixture<CreditCardPurchasesPage>> {
    const api = {
      getMonthly: vi.fn().mockReturnValue(
        of({
          year: 2026,
          month: 9,
          summary: {
            total: purchases.length ? 300 : 0,
            paidTotal: 0,
            pendingTotal: purchases.length ? 300 : 0,
            totalCount: purchases.length,
            paidCount: 0,
            pendingCount: purchases.length,
            paidPercentage: 0,
          },
          items: purchases,
        }),
      ),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateInstallmentAmount: vi.fn(),
      updateInstallmentStatus: vi.fn(),
      delete: vi.fn(),
    };
    const cardsApi = {
      getOverview: vi.fn().mockReturnValue(of(cardOverview)),
    };
    const accountsApi = {
      getOverview: vi.fn().mockReturnValue(of(accountOverview)),
    };
    const toastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreditCardPurchasesPage],
      providers: [
        { provide: CreditCardPurchasesApi, useValue: api },
        { provide: CreditCardsApi, useValue: cardsApi },
        { provide: AccountsApi, useValue: accountsApi },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CreditCardPurchasesPage);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('shows first-use empty state without filters when there are no purchases', async () => {
    const fixture = await setup([]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Nenhuma parcela nesta competência');
    expect(element.textContent).not.toContain('Ordenar por');
  });

  it('shows summary, cards and search-empty state for existing purchases', async () => {
    const fixture = await setup([purchase]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Total do mês');
    expect(element.textContent).toContain('Notebook');
    expect(element.textContent).toContain('Nova compra');
    const currentCompetence = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
      .format(new Date())
      .replace(/^./, (character) => character.toUpperCase());
    expect(element.textContent).toContain(currentCompetence);

    const input = element.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'mercado';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Nenhuma parcela encontrada');
    expect(element.textContent).not.toContain('Nenhuma parcela nesta competência');
  });
});
