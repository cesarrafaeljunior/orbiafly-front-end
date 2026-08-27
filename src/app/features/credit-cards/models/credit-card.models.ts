export type CreditCardBrand =
  | 'MASTERCARD'
  | 'VISA'
  | 'ELO'
  | 'AMERICAN_EXPRESS'
  | 'HIPERCARD'
  | 'OTHER';

export interface CreditCard {
  id: string;
  name: string;
  brand: CreditCardBrand;
  lastFourDigits: string | null;
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCardOverview {
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  activeCount: number;
  cards: CreditCard[];
}

export interface CreditCardPayload {
  name: string;
  brand: CreditCardBrand;
  lastFourDigits: string;
  totalLimit: number;
  closingDay: number;
  dueDay: number;
}

export interface ApiProblem {
  detail?: string;
  violations?: Record<string, string>;
}

export const CREDIT_CARD_BRAND_LABELS: Record<CreditCardBrand, string> = {
  MASTERCARD: 'Mastercard',
  VISA: 'Visa',
  ELO: 'Elo',
  AMERICAN_EXPRESS: 'American Express',
  HIPERCARD: 'Hipercard',
  OTHER: 'Outra',
};
