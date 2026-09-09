import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DashboardApi } from '../../services/dashboard-api';
import { dashboardFixture } from '../../testing/dashboard.fixture';
import { DashboardPage } from './dashboard-page';

registerLocaleData(localePt);

describe('DashboardPage', () => {
  async function setup(response = dashboardFixture): Promise<ComponentFixture<DashboardPage>> {
    const api = { getMonthly: vi.fn().mockReturnValue(of(response)) };
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), { provide: DashboardApi, useValue: api }],
    }).compileComponents();
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders backend totals and links to expense management', async () => {
    const fixture = await setup();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('R$ 2.500,00');
    expect(element.textContent).toContain('R$ 3.700,00');
    expect(element.textContent).toContain('Caixa');
    expect(element.textContent).toContain('48% pago');
    expect(element.textContent).toContain('1 vencida');
    expect(element.textContent).toContain('Energia');
    expect(element.textContent).toContain('Moradia');
    expect(element.querySelector('a[href="/despesas-fixas"]')).not.toBeNull();
    expect(element.querySelector('a[href="/contas"]')).not.toBeNull();
  });

  it('renders a useful empty state with a management action', async () => {
    const fixture = await setup({
      ...dashboardFixture,
      competence: { year: 2026, month: 9 },
      accounts: { availableBalance: 0, activeCount: 0, items: [] },
      summary: {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalCount: 0,
        paidCount: 0,
        pendingCount: 0,
        paidPercentage: null,
      },
      overdue: { count: 0, amount: 0 },
      projection: {
        ...dashboardFixture.projection,
        year: 2026,
        month: 9,
        currentBalance: 0,
        expectedIncomeTotal: 0,
        expectedExpenseTotal: 0,
        projectedFinalBalance: 0,
        minimumProjectedBalance: 0,
        minimumProjectedBalanceDate: '2026-09-01',
        events: [],
      },
      upcomingExpenses: [],
      categories: [],
      largestExpenses: [],
    });
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Nenhuma despesa em');
    expect(element.textContent).toContain('Gerenciar despesas');
    expect(element.querySelector('.summary-band')).toBeNull();
  });
  it('limits dynamic lists and allows categories to expand and collapse', async () => {
    const categories = Array.from({ length: 8 }, (_, index) => ({
      ...dashboardFixture.categories[0],
      categoryId: `category-${index}`,
      categoryName: `Categoria ${index}`,
      totalAmount: index * 100,
    }));
    const fixture = await setup({
      ...dashboardFixture,
      categories,
      upcomingExpenses: Array.from({ length: 8 }, (_, index) => ({
        ...dashboardFixture.upcomingExpenses[0],
        occurrenceId: `expense-${index}`,
      })),
    });
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.category-row')).toHaveLength(3);
    expect(element.querySelector('.category-row')?.textContent).toContain('Categoria 7');
    expect(element.querySelectorAll('.expense-item')).toHaveLength(3);
    expect(element.querySelector('.upcoming-section a')?.getAttribute('href')).toBe(
      '/despesas-fixas',
    );
    const toggle = element.querySelector<HTMLButtonElement>('.category-toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelectorAll('.category-row')).toHaveLength(8);
    expect(element.querySelector('.category-chart--expanded')?.getAttribute('tabindex')).toBe('0');
    toggle.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.category-row')).toHaveLength(3);
    expect(categories[0].categoryId).toBe('category-0');
  });
});
