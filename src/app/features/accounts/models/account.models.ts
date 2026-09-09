export type FinancialAccountType = 'CHECKING' | 'SAVINGS' | 'DIGITAL_ACCOUNT' | 'CASH' | 'OTHER';

export type FinancialTransactionType =
  'CREDIT' | 'DEBIT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';

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
  referenceType:
    | 'FIXED_EXPENSE_OCCURRENCE'
    | 'INSTALLMENT_EXPENSE_INSTALLMENT'
    | 'LOAN_ENTRY'
    | 'EXPECTED_INCOME'
    | 'ACCOUNT_TRANSFER'
    | 'CREDIT_CARD_PURCHASE'
    | null;
  referenceId: string | null;
  reversalOfId: string | null;
  createdAt: string;
}

export interface AccountTransactionResult {
  financialAccount: FinancialAccount;
  transaction: FinancialTransaction;
}

export interface AccountTransfer {
  id: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationAccountId: string;
  destinationAccountName: string;
  amount: number;
  transferDate: string;
  description: string;
  sourceTransactionId: string;
  destinationTransactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountTransferPayload {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  transferDate: string;
  description: string | null;
}

export interface AccountTransferOverview {
  transferredTotal: number;
  transferCount: number;
  items: AccountTransfer[];
}

export interface AccountTransferResult {
  transfer: AccountTransfer;
  source: AccountTransactionResult;
  destination: AccountTransactionResult;
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
