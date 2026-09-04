export type PaymentStatus = 'PENDING' | 'PAID';

export interface InstallmentPurchasePayload {
  description: string;
  totalAmount: number;
  installmentCount: number;
  firstInstallmentDate: string;
}

export interface InstallmentExpenseInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt: string | null;
  financialAccountId: string | null;
  paymentTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentPurchase {
  id: string;
  description: string;
  totalAmount: number;
  installmentCount: number;
  firstInstallmentDate: string;
  paidAmount: number;
  pendingAmount: number;
  installments: InstallmentExpenseInstallment[];
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentPaymentResult {
  installment: InstallmentExpenseInstallment;
}
