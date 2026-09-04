import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreditCardsApi } from '../../credit-cards/services/credit-cards-api';
import { ToastService } from '../../../shared/services/toast.service';
import { CreditCardPurchasesApi } from './credit-card-purchases-api';
import { CreditCardPurchasesStore } from './credit-card-purchases-store';

const overview = {
  totalCommitted: 3000,
  activePurchaseCount: 1,
  futureInstallmentCount: 10,
  currentMonthInstallmentsAmount: 300,
  purchases: [],
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

describe('CreditCardPurchasesStore', () => {
  const api = {
    getOverview: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const cardsApi = {
    getOverview: vi.fn(),
  };
  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  let store: CreditCardPurchasesStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(of(overview));
    cardsApi.getOverview.mockReturnValue(of(cardOverview));
    TestBed.configureTestingModule({
      providers: [
        CreditCardPurchasesStore,
        { provide: CreditCardPurchasesApi, useValue: api },
        { provide: CreditCardsApi, useValue: cardsApi },
        { provide: ToastService, useValue: toastService },
      ],
    });
    store = TestBed.inject(CreditCardPurchasesStore);
  });

  it('loads purchases and active cards', async () => {
    await store.initialize();

    expect(api.getOverview).toHaveBeenCalled();
    expect(cardsApi.getOverview).toHaveBeenCalledWith(false);
    expect(store.overview()).toEqual(overview);
    expect(store.activeCards()).toEqual(cardOverview.cards);
  });

  it('creates and deletes purchases using the global toast', async () => {
    api.create.mockReturnValue(of({}));
    api.delete.mockReturnValue(of(undefined));

    await expect(
      store.create({
        description: 'Notebook',
        creditCardId: 'card-1',
        totalAmount: 3000,
        purchaseDate: '2026-08-01',
        installmentCount: 10,
      }),
    ).resolves.toBe(true);
    await expect(store.delete('purchase-1')).resolves.toBe(true);

    expect(toastService.success).toHaveBeenCalledWith('Compra parcelada registrada com sucesso.');
    expect(toastService.success).toHaveBeenCalledWith('Compra parcelada excluída com sucesso.');
  });

  it('shows API error details without a local toast implementation', async () => {
    api.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { detail: 'Limite disponível insuficiente.' },
          }),
      ),
    );

    await expect(
      store.create({
        description: 'Notebook',
        creditCardId: 'card-1',
        totalAmount: 3000,
        purchaseDate: '2026-08-01',
        installmentCount: 10,
      }),
    ).resolves.toBe(false);

    expect(toastService.error).toHaveBeenCalledWith('Limite disponível insuficiente.');
  });
});
