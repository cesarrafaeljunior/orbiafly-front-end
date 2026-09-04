import { CreditCardBrand } from '../../credit-cards/models/credit-card.models';

export type CreditCardPurchaseStatus = 'EM_ANDAMENTO' | 'FINALIZADA';
export type CreditCardInstallmentStatus = 'PENDING';

export interface CreditCardInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  competenceYear: number;
  competenceMonth: number;
  dueDate: string;
  status: CreditCardInstallmentStatus;
  createdAt: string;
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
