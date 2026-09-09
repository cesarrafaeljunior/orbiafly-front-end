import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HEALTH_LEVEL_LABELS } from '../../models/dashboard.models';
import { DashboardStore } from '../../services/dashboard-store';
import { AccountsSummary } from '../../components/accounts-summary/accounts-summary';

@Component({
  imports: [AccountsSummary, CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  providers: [DashboardStore],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  protected readonly store = inject(DashboardStore);
  protected readonly healthLabels = HEALTH_LEVEL_LABELS;

  protected readonly categoriesExpanded = signal(false);
  protected readonly categories = computed(() =>
    [...(this.store.dashboard()?.categories ?? [])].sort((a, b) => b.totalAmount - a.totalAmount),
  );
  protected readonly visibleCategories = computed(() =>
    this.categoriesExpanded() ? this.categories() : this.categories().slice(0, 3),
  );
  protected readonly visibleProjectionEvents = computed(() =>
    (this.store.dashboard()?.projection.events ?? []).slice(0, 6),
  );

  protected moveMonth(offset: number): void {
    this.categoriesExpanded.set(false);
    void this.store.moveMonth(offset);
  }

  ngOnInit(): void {
    void this.store.initialize();
  }
}
