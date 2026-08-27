export type PaymentStatus = 'PENDING' | 'PAID';
export type ExpenseStatusFilter = 'ALL' | PaymentStatus | 'OVERDUE';
export type ExpenseSortOption =
  | 'DUE_ASC'
  | 'DUE_DESC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC'
  | 'NAME_ASC'
  | 'NAME_DESC';

export interface Category {
  id: string;
  name: string;
}

export interface FixedExpensePayload {
  name: string;
  defaultAmount: number;
  dueDay: number;
  categoryId: string;
  active?: boolean;
}

export interface FixedExpense {
  id: string;
  name: string;
  defaultAmount: number;
  dueDay: number;
  categoryId: string;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpense {
  occurrenceId: string;
  fixedExpenseId: string;
  name: string;
  amount: number;
  defaultAmount: number;
  dueDate: string;
  dueDay: number;
  categoryId: string;
  category: string;
  status: PaymentStatus;
  paidAt: string | null;
  financialAccountId: string | null;
  financialAccountName: string | null;
  overdue: boolean;
  daysUntilDue: number | null;
  daysOverdue: number | null;
  active: boolean;
}

export interface FixedExpensePaymentResult {
  occurrence: MonthlyExpense;
  payment: {
    id: string;
    balanceEffect: number;
    occurredOn: string;
  };
  financialAccount: {
    id: string;
    name: string;
    currentBalance: number;
    active: boolean;
  };
  updatedBalance: number;
  negativeBalance: boolean;
}

export interface MonthlySummary {
  total: number;
  paidTotal: number;
  pendingTotal: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  paidPercentage: number;
}

export interface MonthlyExpensesResponse {
  year: number;
  month: number;
  summary: MonthlySummary;
  items: MonthlyExpense[];
}

export interface ApiProblem {
  detail?: string;
  violations?: Record<string, string>;
}
