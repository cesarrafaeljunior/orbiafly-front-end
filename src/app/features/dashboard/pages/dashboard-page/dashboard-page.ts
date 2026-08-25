import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  ngOnInit(): void {
    void this.store.initialize();
  }
}
