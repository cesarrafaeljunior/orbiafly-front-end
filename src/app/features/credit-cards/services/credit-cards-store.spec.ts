import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../shared/services/toast.service';
import { CreditCard } from '../models/credit-card.models';
import { CreditCardsApi } from './credit-cards-api';
import { CreditCardsStore } from './credit-cards-store';

const card: CreditCard = {
  id: 'card-1',
  name: 'Nubank',
  brand: 'MASTERCARD',
  lastFourDigits: '1234',
  totalLimit: 5000,
  usedLimit: 0,
  availableLimit: 5000,
  closingDay: 3,
  dueDay: 10,
  active: true,
  deletedAt: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

describe('CreditCardsStore', () => {
  const api = {
    getOverview: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    reactivate: vi.fn(),
    delete: vi.fn(),
  };
  const toastService = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  let store: CreditCardsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(
      of({
        totalLimit: 5000,
        usedLimit: 0,
        availableLimit: 5000,
        activeCount: 1,
        cards: [card],
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        CreditCardsStore,
        { provide: CreditCardsApi, useValue: api },
        { provide: ToastService, useValue: toastService },
      ],
    });
    store = TestBed.inject(CreditCardsStore);
  });

  it('loads overview and exposes derived usage percentage', async () => {
    await store.initialize();

    expect(api.getOverview).toHaveBeenCalledWith(false);
    expect(store.overview().cards).toEqual([card]);
    expect(store.usagePercentage()).toBe(0);
  });

  it('creates, updates and runs lifecycle actions with global toast', async () => {
    api.create.mockReturnValue(of(card));
    api.update.mockReturnValue(of({ ...card, name: 'Nubank Ultravioleta' }));
    api.deactivate.mockReturnValue(of({ ...card, active: false }));
    api.reactivate.mockReturnValue(of(card));
    api.delete.mockReturnValue(of(undefined));

    await expect(
      store.create({
        name: 'Nubank',
        brand: 'MASTERCARD',
        lastFourDigits: '1234',
        totalLimit: 5000,
        closingDay: 3,
        dueDay: 10,
      }),
    ).resolves.toBe(true);
    await expect(store.update(card, { ...card, lastFourDigits: '4321' })).resolves.toBe(true);
    await expect(store.deactivate(card)).resolves.toBe(true);
    await expect(store.reactivate({ ...card, active: false })).resolves.toBe(true);
    await expect(store.delete({ ...card, active: false })).resolves.toBe(true);

    expect(toastService.success).toHaveBeenCalledWith('Cartão criado com sucesso.');
    expect(toastService.success).toHaveBeenCalledWith('Cartão atualizado com sucesso.');
    expect(toastService.success).toHaveBeenCalledWith('Cartão desativado com sucesso.');
    expect(toastService.success).toHaveBeenCalledWith('Cartão reativado com sucesso.');
    expect(toastService.success).toHaveBeenCalledWith('Cartão excluído com sucesso.');
  });

  it('exposes API errors without local toast implementation', async () => {
    api.getOverview.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 503,
            error: { detail: 'Serviço indisponível.' },
          }),
      ),
    );

    await store.loadCards();

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Serviço indisponível.');
  });
});
