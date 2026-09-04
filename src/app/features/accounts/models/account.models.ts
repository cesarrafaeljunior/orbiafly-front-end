export type FinancialAccountType = 'CHECKING' | 'SAVINGS' | 'DIGITAL_ACCOUNT' | 'CASH' | 'OTHER';

export type FinancialTransactionType = 'CREDIT' | 'DEBIT' | 'ADJUSTMENT';

export interface FinancialAccount {
  id: string;
  name: string;
  type: FinancialAccountType;
  institution: string | null;
  openingBalance: number;
  currentBalance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAccountsOverview {
  totalAvailableBalance: number;
  activeCount: number;
  accounts: FinancialAccount[];
}

export interface FinancialAccountPayload {
  name: string;
  type: FinancialAccountType;
  institution: string;
  openingBalance?: number;
}

export interface FinancialTransaction {
  id: string;
  financialAccountId: string;
  type: FinancialTransactionType;
  amount: number;
  balanceEffect: number;
  description: string;
  occurredOn: string;
  referenceType: 'FIXED_EXPENSE_OCCURRENCE' | 'LOAN_ENTRY' | null;
  referenceId: string | null;
  reversalOfId: string | null;
  createdAt: string;
}

export interface AccountTransactionResult {
  financialAccount: FinancialAccount;
  transaction: FinancialTransaction;
}

export interface ApiProblem {
  detail?: string;
  violations?: Record<string, string>;
}

export const ACCOUNT_TYPE_LABELS: Record<FinancialAccountType, string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  DIGITAL_ACCOUNT: 'Conta digital',
  CASH: 'Dinheiro',
  OTHER: 'Outra',
};
