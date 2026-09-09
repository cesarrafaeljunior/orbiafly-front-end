import { MonthlyDashboard } from '../models/dashboard.models';

export const dashboardFixture: MonthlyDashboard = {
  competence: { year: 2026, month: 8 },
  accounts: {
    availableBalance: 3700,
    activeCount: 2,
    items: [
      { id: 'account-cash', name: 'Caixa', type: 'CASH', currentBalance: 2500 },
      { id: 'account-digital', name: 'Nubank', type: 'DIGITAL_ACCOUNT', currentBalance: 1200 },
    ],
  },
  summary: {
    totalAmount: 2500,
    paidAmount: 1200,
    pendingAmount: 1300,
    totalCount: 5,
    paidCount: 2,
    pendingCount: 3,
    paidPercentage: 48,
  },
  overdue: { count: 1, amount: 1000 },
  projection: {
    year: 2026,
    month: 8,
    currentBalance: 3700,
    expectedIncomeTotal: 0,
    expectedExpenseTotal: 1300,
    projectedFinalBalance: 2400,
    minimumProjectedBalance: 2400,
    minimumProjectedBalanceDate: '2026-08-20',
    healthLevel: 'COMFORTABLE',
    insight: 'Seu menor saldo previsto é de 2400.00 em 20/08.',
    events: [
      {
        date: '2026-08-20',
        description: 'Energia',
        amount: 250,
        direction: 'OUTFLOW',
        sourceType: 'FIXED_EXPENSE',
        sourceId: 'occurrence-energy',
        projectedBalanceAfterEvent: 3450,
      },
    ],
  },
  upcomingExpenses: [
    {
      occurrenceId: 'occurrence-energy',
      name: 'Energia',
      amount: 250,
      dueDay: 20,
      dueDate: '2026-08-20',
      categoryId: 'category-home',
      categoryName: 'Casa',
      status: 'PENDING',
    },
  ],
  categories: [
    {
      categoryId: 'category-housing',
      categoryName: 'Moradia',
      totalAmount: 900,
      percentage: 36,
    },
  ],
  largestExpenses: [
    {
      occurrenceId: 'occurrence-loan',
      name: 'Empréstimo',
      amount: 1000,
      dueDay: 15,
      dueDate: '2026-08-15',
      categoryId: 'category-loan',
      categoryName: 'Empréstimo',
      status: 'PENDING',
    },
  ],
};
