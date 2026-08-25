import { ApiProblem, PaymentStatus } from '../../fixed-expenses/models/fixed-expense.models';
import { FinancialAccountType } from '../../accounts/models/account.models';

export type { ApiProblem };

export interface DashboardCompetence {
  year: number;
  month: number;
}

export interface DashboardSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  paidPercentage: number | null;
}

export interface DashboardOverdue {
  count: number;
  amount: number;
}

export interface DashboardAccounts {
  availableBalance: number;
  activeCount: number;
  items: {
    id: string;
    name: string;
    type: FinancialAccountType;
    currentBalance: number;
  }[];
}

export interface DashboardExpense {
  occurrenceId: string;
  name: string;
  amount: number;
  dueDay: number;
  dueDate: string;
  categoryId: string;
  categoryName: string;
  status: PaymentStatus;
}

export interface DashboardCategory {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number | null;
}

export interface MonthlyDashboard {
  competence: DashboardCompetence;
  accounts: DashboardAccounts;
  summary: DashboardSummary;
  overdue: DashboardOverdue;
  upcomingExpenses: DashboardExpense[];
  categories: DashboardCategory[];
  largestExpenses: DashboardExpense[];
}
