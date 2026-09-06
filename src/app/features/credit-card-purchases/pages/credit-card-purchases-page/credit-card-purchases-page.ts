import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { CREDIT_CARD_BRAND_LABELS } from '../../../credit-cards/models/credit-card.models';
import {
  CreditCardInstallmentStatusFilter,
  CreditCardMonthlyPurchaseInstallment,
  CreditCardPurchasePayload,
  CreditCardPurchaseSortOption,
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
  protected readonly deletingPurchase = signal<CreditCardMonthlyPurchaseInstallment | null>(null);
  protected readonly monthlyInstallment = signal<CreditCardMonthlyPurchaseInstallment | null>(null);
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
    installmentCount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(360)],
    }),
  });

  protected readonly selectedCard = computed(() => {
    const cardId = this.purchaseForm.controls.creditCardId.value;
    return cardId ? this.store.cardById(cardId) : null;
  });

  protected readonly installmentPreviewAmount = computed(() => {
    const total = this.purchaseForm.controls.totalAmount.value;
    const count = this.purchaseForm.controls.installmentCount.value;
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
  protected readonly selectedCardAvailableLimit = computed(() => this.selectedCard()?.availableLimit ?? 0);

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
    this.purchaseForm.reset({
      description: '',
      creditCardId: this.store.activeCards()[0]?.id ?? '',
      totalAmount: 0,
      purchaseDate: this.today(),
      installmentCount: 1,
    });
    this.showPurchaseForm.set(true);
  }

  protected closePurchaseForm(): void {
    this.showPurchaseForm.set(false);
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
      installmentCount: value.installmentCount,
    };
    if (await this.store.create(payload)) {
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

  protected setSearch(event: Event): void {
    this.store.search.set((event.target as HTMLInputElement).value);
  }

  protected setStatusFilter(filter: CreditCardInstallmentStatusFilter): void {
    this.store.statusFilter.set(filter);
  }

  protected setSort(event: Event): void {
    this.store.sortOption.set((event.target as HTMLSelectElement).value as CreditCardPurchaseSortOption);
  }

  protected loadMore(): void {
    this.visibleCount.update((count) => count + 6);
  }

  protected changePayment(item: CreditCardMonthlyPurchaseInstallment): void {
    void this.store.toggleStatus(item);
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

  private selectDefaultCard(): void {
    if (!this.purchaseForm.controls.creditCardId.value && this.store.activeCards().length > 0) {
      this.purchaseForm.controls.creditCardId.setValue(this.store.activeCards()[0].id);
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
