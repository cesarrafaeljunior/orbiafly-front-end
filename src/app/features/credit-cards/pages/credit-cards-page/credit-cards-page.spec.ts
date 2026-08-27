import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../../shared/services/toast.service';
import { CreditCard } from '../../models/credit-card.models';
import { CreditCardsApi } from '../../services/credit-cards-api';
import { CreditCardsPage } from './credit-cards-page';

registerLocaleData(localePt);

const inactiveCard: CreditCard = {
  id: 'card-1',
  name: 'Cartão arquivado',
  brand: 'VISA',
  lastFourDigits: '9876',
  totalLimit: 3200,
  usedLimit: 0,
  availableLimit: 3200,
  closingDay: 5,
  dueDay: 12,
  active: false,
  deletedAt: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-20T00:00:00Z',
};

describe('CreditCardsPage', () => {
  async function setup(
    responses: unknown[],
  ): Promise<{ fixture: ComponentFixture<CreditCardsPage>; api: { getOverview: ReturnType<typeof vi.fn> } }> {
    const api = {
      getOverview: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      reactivate: vi.fn(),
      delete: vi.fn(),
    };
    responses.forEach((response) => api.getOverview.mockReturnValueOnce(of(response)));
    const toastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CreditCardsPage],
      providers: [
        { provide: CreditCardsApi, useValue: api },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CreditCardsPage);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, api };
  }

  it('shows inactive cards instead of the first-use empty state when every card is inactive', async () => {
    const { fixture, api } = await setup([
      { totalLimit: 0, usedLimit: 0, availableLimit: 0, activeCount: 0, cards: [] },
      { totalLimit: 0, usedLimit: 0, availableLimit: 0, activeCount: 0, cards: [inactiveCard] },
    ]);
    const element = fixture.nativeElement as HTMLElement;

    expect(api.getOverview).toHaveBeenNthCalledWith(1, false);
    expect(api.getOverview).toHaveBeenNthCalledWith(2, true);
    expect(element.textContent).toContain('Cartão arquivado');
    expect(element.textContent).toContain('Inativo');
    expect(element.textContent).not.toContain('Nenhum cartão cadastrado');
  });

  it('shows the real empty state only when no cards exist', async () => {
    const { fixture } = await setup([
      { totalLimit: 0, usedLimit: 0, availableLimit: 0, activeCount: 0, cards: [] },
      { totalLimit: 0, usedLimit: 0, availableLimit: 0, activeCount: 0, cards: [] },
    ]);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Nenhum cartão cadastrado');
    expect(element.textContent).toContain('Cadastre seu primeiro cartão');
  });
});
