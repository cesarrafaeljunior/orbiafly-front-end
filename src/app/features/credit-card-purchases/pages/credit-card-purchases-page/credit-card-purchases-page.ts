import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { ACCOUNT_TYPE_LABELS } from '../../../accounts/models/account.models';
import { CREDIT_CARD_BRAND_LABELS } from '../../../credit-cards/models/credit-card.models';
import {
  CreditCardInstallment,
  CreditCardInstallmentStatusFilter,
  CreditCardMonthlyPurchaseInstallment,
  CreditCardPurchase,
  CreditCardPurchasePayload,
  CreditCardPurchaseSortOption,
  CreditCardPurchaseType,
} from '../../models/credit-card-purchase.models';
import { CreditCardPurchasesStore } from '../../services/credit-card-purchases-store';

@Component({
  imports: [CurrencyMaskDirective, CurrencyPipe, DecimalPipe, ReactiveFormsModule],
  providers: [CreditCardPurchasesStore],
  selector: 'app-credit-card-purchases-page',
  styleUrl: './credit-card-purchases-page.scss',
  templateUrl: './credit-card-purchases-page.html',
})
export class CreditCardPurchasesPage implements OnInit {
  protected readonly store = inject(CreditCardPurchasesStore);
  protected readonly brandLabels = CREDIT_CARD_BRAND_LABELS;
  protected readonly showPurchaseForm = signal(false);
  protected readonly editingPurchase = signal<CreditCardPurchase | null>(null);
  protected readonly deletingPurchase = signal<CreditCardMonthlyPurchaseInstallment | null>(null);
  protected readonly monthlyInstallment = signal<CreditCardMonthlyPurchaseInstallment | null>(null);
  protected readonly paymentPurchase = signal<CreditCardPurchase | null>(null);
  protected readonly paymentSourceItem = signal<CreditCardMonthlyPurchaseInstallment | null>(null);
  protected readonly selectedPaidInstallments = signal<ReadonlySet<string>>(new Set());
  protected readonly loadingPaymentPurchase = signal(false);
  protected readonly periodExpanded = signal(false);
  protected readonly selectedMonth = new FormControl(this.store.month(), {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1), Validators.max(12)],
  });
  protected readonly selectedYear = new FormControl(this.store.year(), {
    nonNullable: true,
    validators: [Validators.required, Validators.min(2000), Validators.max(2200), Validators.pattern(/^\d{4}$/)],
  });
  protected readonly monthlyAmount = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0.01)],
  });
  protected readonly months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  protected readonly sortOptions: { value: CreditCardPurchaseSortOption; label: string }[] = [
    { value: 'DUE_ASC', label: 'Vencimento mais próximo' },
    { value: 'DUE_DESC', label: 'Vencimento mais distante' },
    { value: 'AMOUNT_DESC', label: 'Maior valor' },
    { value: 'AMOUNT_ASC', label: 'Menor valor' },
    { value: 'NAME_ASC', label: 'Nome A-Z' },
    { value: 'NAME_DESC', label: 'Nome Z-A' },
  ];
  private readonly listQuery = computed(() =>
    [this.store.year(), this.store.month(), this.store.search(), this.store.statusFilter(), this.store.sortOption()].join('|'),
  );
  protected readonly visibleCount = linkedSignal({ source: this.listQuery, computation: () => 6 });
  protected readonly visibleItems = computed(() => this.store.filteredItems().slice(0, this.visibleCount()));
  protected readonly accountTypeLabels = ACCOUNT_TYPE_LABELS;
  protected readonly selectedPurchaseType = signal<CreditCardPurchaseType>('SINGLE');

  protected readonly purchaseForm = new FormGroup({
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(160)],
    }),
    creditCardId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    totalAmount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    purchaseDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    purchaseType: new FormControl<CreditCardPurchaseType>('SINGLE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    financialAccountId: new FormControl('', {
      nonNullable: true,
    }),
    installmentCount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(360)],
    }),
  });

  protected readonly selectedCard = computed(() => {
    const cardId = this.purchaseForm.controls.creditCardId.value;
    return cardId ? this.store.cardById(cardId) : null;
  });

  protected readonly isInstallmentPurchase = computed(
    () => this.selectedPurchaseType() === 'INSTALLMENT',
  );

  protected readonly installmentPreviewAmount = computed(() => {
    const total = this.purchaseForm.controls.totalAmount.value;
    const count = this.purchaseForm.controls.installmentCount.value;
    if (!this.isInstallmentPurchase()) {
      return total > 0 ? total : 0;
    }
    if (total <= 0 || count <= 0) {
      return 0;
    }
    return Math.floor((total / count) * 100) / 100;
  });

  protected readonly availableAfterPurchase = computed(() => {
    const selectedCard = this.selectedCard();
    if (!selectedCard) {
      return 0;
    }
    return selectedCard.availableLimit - this.purchaseForm.controls.totalAmount.value;
  });
  protected readonly selectedCardAvailableLimit = computed(
    () => this.selectedCard()?.availableLimit ?? 0,
  );

  protected readonly estimatedInvoiceCompetence = computed(() => {
    const selectedCard = this.selectedCard();
    const purchaseDate = this.purchaseForm.controls.purchaseDate.value;
    if (!selectedCard || !purchaseDate) {
      return null;
    }
    return this.invoiceCompetence(purchaseDate, selectedCard.closingDay);
  });

  protected readonly estimatedInvoiceLabel = computed(() => {
    const competence = this.estimatedInvoiceCompetence();
    return competence ? this.monthLabel(competence.year, competence.month) : '-';
  });

  async ngOnInit(): Promise<void> {
    await this.store.initialize();
    this.selectDefaultCard();
  }

  protected togglePeriod(): void {
    this.selectedMonth.setValue(this.store.month());
    this.selectedYear.setValue(this.store.year());
    this.periodExpanded.update((value) => !value);
  }

  protected applyPeriod(): void {
    if (this.selectedMonth.invalid || this.selectedYear.invalid) {
      return;
    }
    const offset = (this.selectedYear.value - this.store.year()) * 12 + Number(this.selectedMonth.value) - this.store.month();
    this.moveMonth(offset);
  }

  protected moveMonth(offset: number): void {
    this.periodExpanded.set(false);
    void this.store.moveMonth(offset);
  }

  protected openCreate(): void {
    this.editingPurchase.set(null);
    this.purchaseForm.reset({
      description: '',
      creditCardId: this.store.activeCards()[0]?.id ?? '',
      totalAmount: 0,
      purchaseDate: this.today(),
      purchaseType: 'SINGLE',
      financialAccountId: this.store.activeAccounts()[0]?.id ?? '',
      installmentCount: 1,
    });
    this.changePurchaseType('SINGLE');
    this.showPurchaseForm.set(true);
  }

  protected closePurchaseForm(): void {
    this.showPurchaseForm.set(false);
    this.editingPurchase.set(null);
  }

  protected async openEdit(item: CreditCardMonthlyPurchaseInstallment): Promise<void> {
    this.loadingPaymentPurchase.set(true);
    const purchase = await this.store.getPurchase(item.purchaseId);
    this.loadingPaymentPurchase.set(false);
    if (!purchase) {
      return;
    }
    this.editingPurchase.set(purchase);
    this.selectedPurchaseType.set(purchase.purchaseType);
    this.purchaseForm.reset({
      description: purchase.description,
      creditCardId: purchase.creditCardId,
      totalAmount: purchase.totalAmount,
      purchaseDate: purchase.purchaseDate,
      purchaseType: purchase.purchaseType,
      financialAccountId: this.store.activeAccounts()[0]?.id ?? '',
      installmentCount: purchase.installmentCount,
    });
    this.changePurchaseType(purchase.purchaseType);
    this.showPurchaseForm.set(true);
  }

  protected async savePurchase(): Promise<void> {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }
    const value = this.purchaseForm.getRawValue();
    const payload: CreditCardPurchasePayload = {
      description: value.description.trim(),
      creditCardId: value.creditCardId,
      totalAmount: value.totalAmount,
      purchaseDate: value.purchaseDate,
      purchaseType: this.selectedPurchaseType(),
      financialAccountId:
        this.selectedPurchaseType() === 'SINGLE' ? value.financialAccountId : null,
      installmentCount:
        this.selectedPurchaseType() === 'INSTALLMENT' ? value.installmentCount : undefined,
    };
    const editingPurchase = this.editingPurchase();
    const saved = editingPurchase
      ? await this.store.updatePurchase(editingPurchase.id, payload)
      : await this.store.create(payload);
    if (saved) {
      this.closePurchaseForm();
      this.selectDefaultCard();
    }
  }

  protected openMonthlyEdit(item: CreditCardMonthlyPurchaseInstallment): void {
    this.monthlyInstallment.set(item);
    this.monthlyAmount.setValue(item.amount);
  }

  protected closeMonthlyEdit(): void {
    this.monthlyInstallment.set(null);
    this.monthlyAmount.reset(0);
  }

  protected async saveMonthlyAmount(): Promise<void> {
    const item = this.monthlyInstallment();
    if (!item || this.monthlyAmount.invalid) {
      this.monthlyAmount.markAsTouched();
      return;
    }
    if (await this.store.updateAmount(item, this.monthlyAmount.value)) {
      this.closeMonthlyEdit();
    }
  }

  protected async confirmDeletion(): Promise<void> {
    const item = this.deletingPurchase();
    if (item && (await this.store.delete(item.purchaseId))) {
      this.deletingPurchase.set(null);
    }
  }

  protected async openPayment(item: CreditCardMonthlyPurchaseInstallment): Promise<void> {
    this.paymentSourceItem.set(item);
    this.loadingPaymentPurchase.set(true);
    const purchase = await this.store.getPurchase(item.purchaseId);
    this.loadingPaymentPurchase.set(false);
    if (!purchase) {
      this.paymentSourceItem.set(null);
      return;
    }
    this.paymentPurchase.set(purchase);
    this.selectedPaidInstallments.set(
      new Set(purchase.installments.filter((installment) => installment.status === 'PAID').map((installment) => installment.id)),
    );
  }

  protected closePayment(): void {
    this.paymentPurchase.set(null);
    this.paymentSourceItem.set(null);
    this.selectedPaidInstallments.set(new Set());
    this.loadingPaymentPurchase.set(false);
  }

  protected toggleInstallmentSelection(installmentId: string): void {
    this.selectedPaidInstallments.update((current) => {
      const next = new Set(current);
      if (next.has(installmentId)) {
        next.delete(installmentId);
      } else {
        next.add(installmentId);
      }
      return next;
    });
  }

  protected async savePaymentSelection(): Promise<void> {
    const purchase = this.paymentPurchase();
    if (!purchase) {
      return;
    }
    if (await this.store.updatePurchaseInstallmentStatuses(purchase, this.selectedPaidInstallments())) {
      this.closePayment();
    }
  }

  protected installmentLabel(installment: CreditCardInstallment): string {
    return `${installment.installmentNumber}/${this.paymentPurchase()?.installmentCount ?? installment.installmentNumber}`;
  }

  protected installmentCompetenceLabel(installment: CreditCardInstallment): string {
    return this.monthLabel(installment.competenceYear, installment.competenceMonth);
  }

  protected paymentProgressPercentage(item: CreditCardMonthlyPurchaseInstallment): number {
    return item.installmentCount === 0 ? 0 : (item.paidInstallmentCount / item.installmentCount) * 100;
  }

  protected setSearch(event: Event): void {
    this.store.search.set((event.target as HTMLInputElement).value);
  }

  protected setStatusFilter(filter: CreditCardInstallmentStatusFilter): void {
    this.store.statusFilter.set(filter);
  }

  protected setSort(event: Event): void {
    this.store.sortOption.set((event.target as HTMLSelectElement).value as CreditCardPurchaseSortOption);
  }

  protected changePurchaseType(type: CreditCardPurchaseType): void {
    this.selectedPurchaseType.set(type);
    this.purchaseForm.controls.purchaseType.setValue(type);
    if (type === 'SINGLE') {
      this.purchaseForm.controls.installmentCount.setValue(1);
      this.purchaseForm.controls.financialAccountId.addValidators(Validators.required);
      if (!this.purchaseForm.controls.financialAccountId.value) {
        this.purchaseForm.controls.financialAccountId.setValue(
          this.store.activeAccounts()[0]?.id ?? '',
        );
      }
    } else {
      this.purchaseForm.controls.financialAccountId.clearValidators();
      this.purchaseForm.controls.financialAccountId.setValue('');
    }
    this.purchaseForm.controls.financialAccountId.updateValueAndValidity();
  }

  protected loadMore(): void {
    this.visibleCount.update((count) => count + 6);
  }

  protected changePayment(item: CreditCardMonthlyPurchaseInstallment): void {
    void this.openPayment(item);
  }

  protected dueBadge(item: CreditCardMonthlyPurchaseInstallment): string {
    return this.formatDayMonth(new Date(`${item.dueDate}T00:00:00Z`));
  }

  protected paymentLabel(item: CreditCardMonthlyPurchaseInstallment): string {
    return item.status === 'PAID' ? 'Pago neste mês' : 'Pendente neste mês';
  }

  protected endingLabel(item: CreditCardMonthlyPurchaseInstallment): string {
    const month = this.monthLabel(item.endingYear, item.endingMonth);
    if (item.monthsUntilEnd === 0) {
      return `Termina em ${month}`;
    }
    if (item.monthsUntilEnd === 1) {
      return `Termina no próximo mês (${month})`;
    }
    return `Termina em ${item.monthsUntilEnd} meses (${month})`;
  }

  protected monthLabel(year: number, month: number): string {
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, month - 1, 1)));
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  protected accountOptionLabel(accountId: string): string {
    const account = this.store.accountById(accountId);
    if (!account) {
      return '';
    }
    const institution = account.institution ? ` - ${account.institution}` : '';
    return `${account.name} - ${this.accountTypeLabels[account.type]}${institution}`;
  }

  protected cardOptionLabel(cardId: string): string {
    const card = this.store.activeCards().find((item) => item.id === cardId);
    if (!card) {
      return '';
    }
    const suffix = card.lastFourDigits ? ` - **** ${card.lastFourDigits}` : '';
    return `${card.name} - ${this.brandLabels[card.brand]}${suffix}`;
  }

  private formatDayMonth(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date);
  }

  private invoiceCompetence(
    purchaseDateValue: string,
    closingDay: number,
  ): { year: number; month: number } {
    const [yearValue, monthValue, dayValue] = purchaseDateValue.split('-').map(Number);
    const date = new Date(Date.UTC(yearValue, monthValue - 1, dayValue));
    if (dayValue > closingDay) {
      date.setUTCMonth(date.getUTCMonth() + 1);
    }
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
  }

  private selectDefaultCard(): void {
    if (!this.purchaseForm.controls.creditCardId.value && this.store.activeCards().length > 0) {
      this.purchaseForm.controls.creditCardId.setValue(this.store.activeCards()[0].id);
    }
    if (
      !this.purchaseForm.controls.financialAccountId.value
      && this.store.activeAccounts().length > 0
    ) {
      this.purchaseForm.controls.financialAccountId.setValue(this.store.activeAccounts()[0].id);
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
