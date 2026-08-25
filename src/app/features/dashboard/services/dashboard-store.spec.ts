import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MonthlyDashboard } from '../models/dashboard.models';
import { dashboardFixture } from '../testing/dashboard.fixture';
import { DashboardApi } from './dashboard-api';
import { DashboardStore } from './dashboard-store';

describe('DashboardStore', () => {
  const api = { getMonthly: vi.fn() };
  let store: DashboardStore;

  beforeEach(() => {
    vi.clearAllMocks();
    api.getMonthly.mockReturnValue(of(dashboardFixture));
    TestBed.configureTestingModule({
      providers: [DashboardStore, { provide: DashboardApi, useValue: api }],
    });
    store = TestBed.inject(DashboardStore);
    store.year.set(2026);
    store.month.set(8);
  });

  it('loads the monthly dashboard without recalculating the response', async () => {
    await store.initialize();

    expect(store.loading()).toBe(false);
    expect(store.dashboard()).toEqual(dashboardFixture);
    expect(store.periodLabel()).toBe('Agosto de 2026');
    expect(api.getMonthly).toHaveBeenCalledWith(2026, 8);
  });

  it('keeps the loading state until the monthly request completes', async () => {
    const response = new Subject<MonthlyDashboard>();
    api.getMonthly.mockReturnValue(response);

    const loading = store.loadMonth();

    expect(store.loading()).toBe(true);
    expect(store.dashboard()).toBeNull();

    response.next(dashboardFixture);
    response.complete();
    await loading;

    expect(store.loading()).toBe(false);
    expect(store.dashboard()).toEqual(dashboardFixture);
  });

  it('moves to another competence and requests fresh data', async () => {
    await store.moveMonth(1);

    expect(store.year()).toBe(2026);
    expect(store.month()).toBe(9);
    expect(api.getMonthly).toHaveBeenCalledWith(2026, 9);
  });

  it('clears stale values and exposes the API error', async () => {
    store.dashboard.set(dashboardFixture);
    api.getMonthly.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 503,
            error: { detail: 'Dashboard indisponível.' },
          }),
      ),
    );

    await store.loadMonth();

    expect(store.dashboard()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Dashboard indisponível.');
  });
});
