import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then((component) => component.LoginPage),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page').then((component) => component.RegisterPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
        (component) => component.DashboardPage,
      ),
  },
  {
    path: 'despesas-fixas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/fixed-expenses/pages/fixed-expenses-page/fixed-expenses-page').then(
        (component) => component.FixedExpensesPage,
      ),
  },
  {
    path: 'contas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/accounts/pages/accounts-page/accounts-page').then(
        (component) => component.AccountsPage,
      ),
  },
  {
    path: 'cartoes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/credit-cards/pages/credit-cards-page/credit-cards-page').then(
        (component) => component.CreditCardsPage,
      ),
  },
  {
    path: 'parcelados',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/installment-expenses/pages/installment-expenses-page/installment-expenses-page').then(
        (component) => component.InstallmentExpensesPage,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
