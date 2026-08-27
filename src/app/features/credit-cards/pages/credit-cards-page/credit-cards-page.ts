import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import {
  CREDIT_CARD_BRAND_LABELS,
  CreditCard,
  CreditCardBrand,
  CreditCardPayload,
} from '../../models/credit-card.models';
import { CreditCardsStore } from '../../services/credit-cards-store';

type CreditCardStatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';
type CreditCardSortOption = 'NAME_ASC' | 'NAME_DESC' | 'LIMIT_DESC' | 'LIMIT_ASC';

@Component({
  imports: [CurrencyMaskDirective, CurrencyPipe, DecimalPipe, ReactiveFormsModule],
  providers: [CreditCardsStore],
  selector: 'app-credit-cards-page',
  styleUrl: './credit-cards-page.scss',
  templateUrl: './credit-cards-page.html',
})
export class CreditCardsPage implements OnInit {
  protected readonly store = inject(CreditCardsStore);
  protected readonly brandLabels = CREDIT_CARD_BRAND_LABELS;
  protected readonly brands = Object.keys(CREDIT_CARD_BRAND_LABELS) as CreditCardBrand[];
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<CreditCardStatusFilter>('ACTIVE');
  protected readonly sortOption = signal<CreditCardSortOption>('NAME_ASC');
  protected readonly showCardForm = signal(false);
  protected readonly editingCard = signal<CreditCard | null>(null);
  protected readonly deactivatingCard = signal<CreditCard | null>(null);
  protected readonly deletingCard = signal<CreditCard | null>(null);

  protected readonly filteredCards = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    const status = this.statusFilter();
    const sort = this.sortOption();

    return this.store
      .overview()
      .cards.filter((card) => {
        if (status === 'ACTIVE' && !card.active) {
          return false;
        }
        if (status === 'INACTIVE' && card.active) {
          return false;
        }
        if (!query) {
          return true;
        }
        const searchable = [card.name, this.brandLabels[card.brand], card.lastFourDigits]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('pt-BR');
        return searchable.includes(query);
      })
      .sort((left, right) => {
        switch (sort) {
          case 'NAME_DESC':
            return right.name.localeCompare(left.name, 'pt-BR');
          case 'LIMIT_DESC':
            return right.totalLimit - left.totalLimit;
          case 'LIMIT_ASC':
            return left.totalLimit - right.totalLimit;
          case 'NAME_ASC':
          default:
            return left.name.localeCompare(right.name, 'pt-BR');
        }
      });
  });
  protected readonly hasOnlyInactiveCards = computed(
    () => this.store.includeInactive() && this.store.overview().cards.length > 0 && this.store.overview().activeCount === 0,
  );

  protected readonly cardForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    brand: new FormControl<CreditCardBrand>('MASTERCARD', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastFourDigits: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^$|^[0-9]{4}$/)],
    }),
    totalLimit: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    closingDay: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(31)],
    }),
    dueDay: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(31)],
    }),
  });

  async ngOnInit(): Promise<void> {
    await this.store.initialize();
    await this.ensureInactiveCardsAreVisible();
  }

  protected openCreate(): void {
    this.editingCard.set(null);
    this.cardForm.reset({
      name: '',
      brand: 'MASTERCARD',
      lastFourDigits: '',
      totalLimit: 0,
      closingDay: 1,
      dueDay: 1,
    });
    this.showCardForm.set(true);
  }

  protected openEdit(card: CreditCard): void {
    if (!card.active) {
      return;
    }
    this.editingCard.set(card);
    this.cardForm.reset({
      name: card.name,
      brand: card.brand,
      lastFourDigits: card.lastFourDigits ?? '',
      totalLimit: card.totalLimit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
    });
    this.showCardForm.set(true);
  }

  protected closeCardForm(): void {
    this.showCardForm.set(false);
    this.editingCard.set(null);
  }

  protected async saveCard(): Promise<void> {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }
    const value = this.cardForm.getRawValue();
    const payload: CreditCardPayload = {
      name: value.name,
      brand: value.brand,
      lastFourDigits: value.lastFourDigits,
      totalLimit: value.totalLimit,
      closingDay: value.closingDay,
      dueDay: value.dueDay,
    };
    const editing = this.editingCard();
    const success = editing
      ? await this.store.update(editing, payload)
      : await this.store.create(payload);
    if (success) {
      this.closeCardForm();
    }
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected async changeStatusFilter(filter: CreditCardStatusFilter): Promise<void> {
    if (filter === 'ACTIVE' && this.hasOnlyInactiveCards()) {
      return;
    }
    this.statusFilter.set(filter);
    await this.store.setIncludeInactive(filter !== 'ACTIVE');
  }

  protected changeSort(event: Event): void {
    this.sortOption.set((event.target as HTMLSelectElement).value as CreditCardSortOption);
  }

  protected usagePercentage(card: CreditCard): number {
    if (card.totalLimit <= 0) {
      return 0;
    }
    return Math.min(100, (card.usedLimit / card.totalLimit) * 100);
  }

  protected async confirmDeactivation(): Promise<void> {
    const card = this.deactivatingCard();
    if (card && (await this.store.deactivate(card))) {
      this.deactivatingCard.set(null);
      await this.ensureInactiveCardsAreVisible();
    }
  }

  protected async reactivateCard(card: CreditCard): Promise<void> {
    if (await this.store.reactivate(card)) {
      this.statusFilter.set('ACTIVE');
      await this.store.setIncludeInactive(false);
    }
  }

  protected async confirmDeletion(): Promise<void> {
    const card = this.deletingCard();
    if (card && (await this.store.delete(card))) {
      this.deletingCard.set(null);
      await this.ensureInactiveCardsAreVisible();
    }
  }

  private async ensureInactiveCardsAreVisible(): Promise<void> {
    if (this.store.overview().cards.length > 0 || this.store.includeInactive()) {
      return;
    }

    await this.store.setIncludeInactive(true);

    if (this.store.overview().cards.length > 0 && this.store.overview().activeCount === 0) {
      this.statusFilter.set('INACTIVE');
    }
  }
}
