import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { CREDIT_CARD_BRAND_LABELS } from '../../../credit-cards/models/credit-card.models';
import {
  CreditCardPurchase,
  CreditCardPurchasePayload,
  CreditCardPurchaseStatus,
} from '../../models/credit-card-purchase.models';
import { CreditCardPurchasesStore } from '../../services/credit-card-purchases-store';

type PurchaseStatusFilter = 'ALL' | CreditCardPurchaseStatus;
type PurchaseSortOption = 'RECENT' | 'AMOUNT_DESC' | 'AMOUNT_ASC' | 'NAME_ASC' | 'NAME_DESC';

@Component({
  imports: [CurrencyMaskDirective, CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule],
  providers: [CreditCardPurchasesStore],
  selector: 'app-credit-card-purchases-page',
  styleUrl: './credit-card-purchases-page.scss',
  templateUrl: './credit-card-purchases-page.html',
})
export class CreditCardPurchasesPage implements OnInit {
  protected readonly store = inject(CreditCardPurchasesStore);
  protected readonly brandLabels = CREDIT_CARD_BRAND_LABELS;
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<PurchaseStatusFilter>('ALL');
  protected readonly sortOption = signal<PurchaseSortOption>('RECENT');
  protected readonly showPurchaseForm = signal(false);
  protected readonly deletingPurchase = signal<CreditCardPurchase | null>(null);

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

  protected readonly filteredPurchases = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    const status = this.statusFilter();
    const sort = this.sortOption();

    return this.store
      .overview()
      .purchases.filter((purchase) => {
        if (status !== 'ALL' && purchase.status !== status) {
          return false;
        }
        if (!query) {
          return true;
        }
        const searchable = [purchase.description, purchase.creditCardName, this.brandLabels[purchase.creditCardBrand]]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pt-BR');
        return searchable.includes(query);
      })
      .sort((left, right) => {
        switch (sort) {
          case 'AMOUNT_DESC':
            return right.totalAmount - left.totalAmount;
          case 'AMOUNT_ASC':
            return left.totalAmount - right.totalAmount;
          case 'NAME_ASC':
            return left.description.localeCompare(right.description, 'pt-BR');
          case 'NAME_DESC':
            return right.description.localeCompare(left.description, 'pt-BR');
          case 'RECENT':
          default:
            return new Date(right.purchaseDate).getTime() - new Date(left.purchaseDate).getTime();
        }
      });
  });

  async ngOnInit(): Promise<void> {
    await this.store.initialize();
    this.selectDefaultCard();
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

  protected async confirmDeletion(): Promise<void> {
    const purchase = this.deletingPurchase();
    if (purchase && (await this.store.delete(purchase.id))) {
      this.deletingPurchase.set(null);
    }
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected changeStatusFilter(filter: PurchaseStatusFilter): void {
    this.statusFilter.set(filter);
  }

  protected changeSort(event: Event): void {
    this.sortOption.set((event.target as HTMLSelectElement).value as PurchaseSortOption);
  }

  protected progressPercentage(purchase: CreditCardPurchase): number {
    if (purchase.installmentCount <= 0) {
      return 0;
    }
    return Math.min(100, (purchase.completedInstallmentCount / purchase.installmentCount) * 100);
  }

  protected purchaseStatusLabel(status: CreditCardPurchaseStatus): string {
    return status === 'FINALIZADA' ? 'Finalizada' : 'Em andamento';
  }

  protected nextInstallmentLabel(purchase: CreditCardPurchase): string {
    if (!purchase.nextInstallment) {
      return 'Ciclo concluído';
    }
    return `Próxima em ${this.monthLabel(
      purchase.nextInstallment.competenceYear,
      purchase.nextInstallment.competenceMonth,
    )}`;
  }

  protected monthLabel(year: number, month: number): string {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1));
  }

  protected cardOptionLabel(cardId: string): string {
    const card = this.store.activeCards().find((item) => item.id === cardId);
    if (!card) {
      return '';
    }
    const suffix = card.lastFourDigits ? ` - **** ${card.lastFourDigits}` : '';
    return `${card.name} - ${this.brandLabels[card.brand]}${suffix}`;
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
