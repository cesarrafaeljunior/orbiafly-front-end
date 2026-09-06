import { CreditCardBrand } from '../../credit-cards/models/credit-card.models';

export type CreditCardPurchaseStatus = 'EM_ANDAMENTO' | 'FINALIZADA';
export type CreditCardInstallmentStatus = 'PENDING' | 'PAID';
export type CreditCardInstallmentStatusFilter = 'ALL' | CreditCardInstallmentStatus;
export type CreditCardPurchaseSortOption =
  | 'DUE_ASC'
  | 'DUE_DESC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC'
  | 'NAME_ASC'
  | 'NAME_DESC';

export interface CreditCardInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  competenceYear: number;
  competenceMonth: number;
  dueDate: string;
  status: CreditCardInstallmentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardPurchase {
  id: string;
  description: string;
  totalAmount: number;
  purchaseDate: string;
  installmentCount: number;
  installmentAmount: number;
  creditCardId: string;
  creditCardName: string;
  creditCardBrand: CreditCardBrand;
  creditCardLastFourDigits: string | null;
  status: CreditCardPurchaseStatus;
  completedInstallmentCount: number;
  futureInstallmentCount: number;
  nextInstallment: CreditCardInstallment | null;
  installments: CreditCardInstallment[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardPurchaseOverview {
  totalCommitted: number;
  activePurchaseCount: number;
  futureInstallmentCount: number;
  currentMonthInstallmentsAmount: number;
  purchases: CreditCardPurchase[];
}

export interface CreditCardPurchasePayload {
  description: string;
  creditCardId: string;
  totalAmount: number;
  purchaseDate: string;
  installmentCount: number;
}

export interface CreditCardMonthlyPurchaseInstallment {
  installmentId: string;
  purchaseId: string;
  description: string;
  amount: number;
  totalAmount: number;
  purchaseDate: string;
  installmentNumber: number;
  installmentCount: number;
  creditCardId: string;
  creditCardName: string;
  creditCardBrand: CreditCardBrand;
  creditCardLastFourDigits: string | null;
  competenceYear: number;
  competenceMonth: number;
  dueDate: string;
  status: CreditCardInstallmentStatus;
  paidAt: string | null;
  paidInstallmentCount: number;
  pendingInstallmentCount: number;
  remainingInstallmentCount: number;
  endingYear: number;
  endingMonth: number;
  monthsUntilEnd: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardMonthlyPurchaseSummary {
  total: number;
  paidTotal: number;
  pendingTotal: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  paidPercentage: number;
}

export interface CreditCardMonthlyPurchasesResponse {
  year: number;
  month: number;
  summary: CreditCardMonthlyPurchaseSummary;
  items: CreditCardMonthlyPurchaseInstallment[];
}
