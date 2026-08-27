import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
        (component) => component.DashboardPage,
      ),
  },
  {
    path: 'despesas-fixas',
    loadComponent: () =>
      import('./features/fixed-expenses/pages/fixed-expenses-page/fixed-expenses-page').then(
        (component) => component.FixedExpensesPage,
      ),
  },
  {
    path: 'contas',
    loadComponent: () =>
      import('./features/accounts/pages/accounts-page/accounts-page').then(
        (component) => component.AccountsPage,
      ),
  },
  {
    path: 'cartoes',
    loadComponent: () =>
      import('./features/credit-cards/pages/credit-cards-page/credit-cards-page').then(
        (component) => component.CreditCardsPage,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
