import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiProblem, MonthlyDashboard } from '../models/dashboard.models';

import { DashboardApi } from './dashboard-api';

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

@Injectable()
export class DashboardStore {
  private readonly api = inject(DashboardApi);
  private requestSequence = 0;
  private readonly now = new Date();

  readonly year = signal(this.now.getFullYear());
  readonly month = signal(this.now.getMonth() + 1);
  readonly dashboard = signal<MonthlyDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly periodLabel = computed(() => {
    const label = monthFormatter.format(new Date(Date.UTC(this.year(), this.month() - 1, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  async initialize(): Promise<void> {
    await this.loadMonth();
  }

  async loadMonth(): Promise<void> {
    const requestId = ++this.requestSequence;
    this.loading.set(true);
    this.error.set(null);
    this.dashboard.set(null);
    try {
      const dashboard = await firstValueFrom(this.api.getMonthly(this.year(), this.month()));
      if (requestId === this.requestSequence) {
        this.dashboard.set(dashboard);
      }
    } catch (error: unknown) {
      if (requestId === this.requestSequence) {
        this.error.set(this.errorMessage(error));
      }
    } finally {
      if (requestId === this.requestSequence) {
        this.loading.set(false);
      }
    }
  }

  async moveMonth(offset: number): Promise<void> {
    const date = new Date(Date.UTC(this.year(), this.month() - 1 + offset, 1));
    this.year.set(date.getUTCFullYear());
    this.month.set(date.getUTCMonth() + 1);
    await this.loadMonth();
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const problem = error.error as ApiProblem | null;
      return problem?.detail ?? 'Não foi possível carregar o resumo desta competência.';
    }
    return 'Não foi possível carregar o resumo desta competência.';
  }
}
