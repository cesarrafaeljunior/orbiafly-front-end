import { Routes } from '@angular/router';
import { authChildGuard } from './features/auth/services/auth.guard';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then(
        (component) => component.LoginPage,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page').then(
        (component) => component.RegisterPage,
      ),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password-page/forgot-password-page').then(
        (component) => component.ForgotPasswordPage,
      ),
  },
  { path: 'cadastro', redirectTo: 'register' },
  {
    path: '',
    component: AppShell,
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
            (component) => component.DashboardPage,
          ),
      },
      {
        path: 'gastos-avulsos',
        loadComponent: () =>
          import('./features/one-off-expenses/pages/one-off-expenses-page/one-off-expenses-page').then(
            (component) => component.OneOffExpensesPage,
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
      {
        path: 'compras-parceladas',
        loadComponent: () =>
          import('./features/credit-card-purchases/pages/credit-card-purchases-page/credit-card-purchases-page').then(
            (component) => component.CreditCardPurchasesPage,
          ),
      },
      {
        path: 'recebimentos',
        loadComponent: () =>
          import('./features/expected-incomes/pages/expected-incomes-page/expected-incomes-page').then(
            (component) => component.ExpectedIncomesPage,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page').then(
            (component) => component.ProfilePage,
          ),
      },
      {
        path: 'emprestimos',
        loadComponent: () =>
          import('./features/loans/pages/loans-page/loans-page').then(
            (component) => component.LoansPage,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
