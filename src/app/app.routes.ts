import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'despesas-fixas',
    loadComponent: () =>
      import('./features/fixed-expenses/pages/fixed-expenses-page/fixed-expenses-page').then(
        (component) => component.FixedExpensesPage,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'despesas-fixas' },
  { path: '**', redirectTo: 'despesas-fixas' },
];
