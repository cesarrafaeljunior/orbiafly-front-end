import { FinancialAccount, FinancialTransaction } from '../../accounts/models/account.models';
import { Category, MonthlySummary, PaymentStatus } from '../../fixed-expenses/models/fixed-expense.models';

export type { Category, MonthlySummary, PaymentStatus };

export type OneOffExpenseFilter = 'ALL' | PaymentStatus | 'OVERDUE';

export interface OneOffExpensePayload {
  name: string;
  amount: number;
  expenseDate: string;
  categoryId: string;
}

export interface OneOffExpense {
  id: string;
  name: string;
  amount: number;
  expenseDate: string;
  categoryId: string;
  category: string;
  status: PaymentStatus;
  paidAt: string | null;
  financialAccountId: string | null;
  financialAccountName: string | null;
  overdue: boolean;
  daysUntilDue: number | null;
  daysOverdue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyOneOffExpensesResponse {
  year: number;
  month: number;
  summary: MonthlySummary;
  items: OneOffExpense[];
}

export interface OneOffExpensePaymentResult {
  expense: OneOffExpense;
  payment: FinancialTransaction;
  financialAccount: FinancialAccount;
  updatedBalance: number;
  negativeBalance: boolean;
}
