import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CreditCardsApi } from '../../../credit-cards/services/credit-cards-api';
import { ToastService } from '../../../../shared/services/toast.service';
import { CreditCardPurchasesApi } from '../../services/credit-card-purchases-api';
import { CreditCardPurchasesPage } from './credit-card-purchases-page';

registerLocaleData(localePt);

const purchase = {
  id: 'purchase-1',
  description: 'Notebook',
  totalAmount: 3000,
  purchaseDate: '2026-08-01',
  installmentCount: 10,
  installmentAmount: 300,
  creditCardId: 'card-1',
  creditCardName: 'Nubank',
  creditCardBrand: 'MASTERCARD',
  creditCardLastFourDigits: '1234',
  status: 'EM_ANDAMENTO',
  completedInstallmentCount: 0,
  futureInstallmentCount: 10,
  nextInstallment: {
    id: 'installment-1',
    installmentNumber: 1,
    amount: 300,
    competenceYear: 2026,
    competenceMonth: 8,
    dueDate: '2026-08-10',
    status: 'PENDING',
    createdAt: '2026-08-01T00:00:00Z',
  },
  installments: [],
  deletedAt: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
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
      getOverview: vi.fn().mockReturnValue(
        of({
          totalCommitted: purchases.length ? 3000 : 0,
          activePurchaseCount: purchases.length,
          futureInstallmentCount: purchases.length ? 10 : 0,
          currentMonthInstallmentsAmount: purchases.length ? 300 : 0,
          purchases,
        }),
      ),
      create: vi.fn(),
      delete: vi.fn(),
    };
    const cardsApi = {
      getOverview: vi.fn().mockReturnValue(of(cardOverview)),
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

    expect(element.textContent).toContain('Nenhuma compra parcelada cadastrada');
    expect(element.textContent).not.toContain('Ordenar por');
  });

  it('shows summary, cards and search-empty state for existing purchases', async () => {
    const fixture = await setup([purchase]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Total comprometido');
    expect(element.textContent).toContain('Notebook');
    expect(element.textContent).toContain('Nova compra');

    const input = element.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'mercado';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Nenhuma compra encontrada');
    expect(element.textContent).not.toContain('Nenhuma compra parcelada cadastrada');
  });
});
