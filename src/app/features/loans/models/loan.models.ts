export type LoanDirection = 'BORROWED' | 'LENT';
export type LoanStatus = 'ACTIVE' | 'COMPLETED';
export type LoanInstallmentStatus = 'PENDING' | 'COMPLETED';

export interface LoanInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: LoanInstallmentStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanEntry {
  id: string;
  installmentId: string | null;
  installmentNumber: number | null;
  amount: number;
  occurredOn: string;
  financialAccountId: string;
  financialAccountName: string | null;
  financialTransactionId: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  name: string;
  direction: LoanDirection;
  counterparty: string;
  totalAmount: number;
  startDate: string;
  installmentCount: number | null;
  installmentAmount: number | null;
  firstDueDate: string | null;
  interestRate: string | null;
  notes: string | null;
  status: LoanStatus;
  settledAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  completedInstallmentCount: number;
  nextInstallment: LoanInstallment | null;
  estimatedEndDate: string | null;
  installments: LoanInstallment[];
  entries: LoanEntry[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanOverview {
  totalBorrowedRemaining: number;
  totalLentRemaining: number;
  activeLoanCount: number;
  upcomingEntryCount: number;
  loans: Loan[];
}

export interface LoanPayload {
  name: string;
  direction: LoanDirection;
  counterparty: string;
  totalAmount: number;
  startDate: string;
  installmentCount?: number;
  installmentAmount?: number;
  firstDueDate?: string;
  interestRate?: string;
  notes?: string;
}

export interface LoanEntryPayload {
  financialAccountId: string;
  amount?: number;
  occurredOn: string;
}

export interface ApiProblem {
  detail?: string;
  violations?: Record<string, string>;
}
