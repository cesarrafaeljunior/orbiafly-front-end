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

export type FinancialHealthLevel = 'CRITICAL' | 'ATTENTION' | 'HEALTHY' | 'COMFORTABLE';
export type ProjectionEventDirection = 'INFLOW' | 'OUTFLOW';
export type ProjectionSourceType =
  | 'EXPECTED_INCOME'
  | 'FIXED_EXPENSE'
  | 'CREDIT_CARD_INSTALLMENT'
  | 'INSTALLMENT_EXPENSE'
  | 'LOAN_INSTALLMENT';

export interface ProjectionEvent {
  date: string;
  description: string;
  amount: number;
  direction: ProjectionEventDirection;
  sourceType: ProjectionSourceType;
  sourceId: string;
  projectedBalanceAfterEvent: number;
}

export interface MonthlyFinancialProjection {
  year: number;
  month: number;
  currentBalance: number;
  expectedIncomeTotal: number;
  expectedExpenseTotal: number;
  projectedFinalBalance: number;
  minimumProjectedBalance: number;
  minimumProjectedBalanceDate: string;
  healthLevel: FinancialHealthLevel;
  insight: string;
  events: ProjectionEvent[];
}

export const HEALTH_LEVEL_LABELS: Record<FinancialHealthLevel, string> = {
  CRITICAL: 'Crítico',
  ATTENTION: 'Atenção',
  HEALTHY: 'Saudável',
  COMFORTABLE: 'Confortável',
};

export interface MonthlyDashboard {
  competence: DashboardCompetence;
  accounts: DashboardAccounts;
  summary: DashboardSummary;
  overdue: DashboardOverdue;
  projection: MonthlyFinancialProjection;
  upcomingExpenses: DashboardExpense[];
  categories: DashboardCategory[];
  largestExpenses: DashboardExpense[];
}
