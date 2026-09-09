import { AccountTransactionResult } from '../../accounts/models/account.models';

export type ExpectedIncomeStatus = 'PENDING' | 'RECEIVED' | 'CANCELED';

export interface ExpectedIncome {
  id: string;
  description: string;
  amount: number;
  expectedDate: string;
  financialAccountId: string | null;
  financialAccountName: string | null;
  status: ExpectedIncomeStatus;
  receivedAt: string | null;
  financialTransactionId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpectedIncomeOverview {
  pendingTotal: number;
  receivedTotal: number;
  canceledTotal: number;
  pendingCount: number;
  receivedCount: number;
  canceledCount: number;
  items: ExpectedIncome[];
}

export interface ExpectedIncomePayload {
  description: string;
  amount: number;
  expectedDate: string;
  financialAccountId: string | null;
  notes: string | null;
}

export interface ReceiveExpectedIncomePayload {
  financialAccountId?: string | null;
  receivedDate?: string | null;
}

export interface ExpectedIncomeReceiptResult {
  income: ExpectedIncome;
  receipt: AccountTransactionResult;
}

export interface ApiProblem {
  detail?: string;
  violations?: Record<string, string>;
}

export const EXPECTED_INCOME_STATUS_LABELS: Record<ExpectedIncomeStatus, string> = {
  PENDING: 'A receber',
  RECEIVED: 'Recebido',
  CANCELED: 'Cancelado',
};
