import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardAccounts } from '../../models/dashboard.models';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-accounts-summary',
  styleUrl: './accounts-summary.scss',
  templateUrl: './accounts-summary.html',
})
export class AccountsSummary {
  readonly accounts = input.required<DashboardAccounts>();
}
