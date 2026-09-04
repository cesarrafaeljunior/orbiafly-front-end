import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyMaskDirective } from '../../../../shared/directives/currency-mask.directive';
import { Loan, LoanDirection, LoanPayload, LoanStatus } from '../../models/loan.models';
import { LoansStore } from '../../services/loans-store';

type LoanFilter = 'ALL' | 'BORROWED' | 'LENT' | 'COMPLETED';
type LoanSort = 'RECENT' | 'REMAINING_DESC' | 'REMAINING_ASC' | 'NAME_ASC' | 'NAME_DESC';

@Component({
  imports: [CurrencyMaskDirective, CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule],
  providers: [LoansStore],
  selector: 'app-loans-page',
  styleUrl: './loans-page.scss',
  templateUrl: './loans-page.html',
})
export class LoansPage implements OnInit {
  protected readonly store = inject(LoansStore);
  protected readonly searchTerm = signal('');
  protected readonly filter = signal<LoanFilter>('ALL');
  protected readonly sort = signal<LoanSort>('RECENT');
  protected readonly showLoanForm = signal(false);
  protected readonly entryLoan = signal<Loan | null>(null);
  protected readonly detailsLoan = signal<Loan | null>(null);
  protected readonly deletingLoan = signal<Loan | null>(null);

  protected readonly loanForm = new FormGroup({
    direction: new FormControl<LoanDirection>('BORROWED', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(140)],
    }),
    counterparty: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(140)],
    }),
    totalAmount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    startDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    hasInstallments: new FormControl(false, { nonNullable: true }),
    installmentCount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.min(1), Validators.max(360)],
    }),
    installmentAmount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    firstDueDate: new FormControl(this.today(), { nonNullable: true }),
    interestRate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(60)],
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  protected readonly entryForm = new FormGroup({
    financialAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0.01)],
    }),
    occurredOn: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly installmentPreviewAmount = computed(() => {
    const total = this.loanForm.controls.totalAmount.value;
    const count = this.loanForm.controls.installmentCount.value;
    if (total <= 0 || count <= 0) {
      return 0;
    }
    return Math.floor((total / count) * 100) / 100;
  });

  protected readonly selectedAccount = computed(() => {
    const id = this.entryForm.controls.financialAccountId.value;
    return id ? this.store.accountById(id) : null;
  });

  protected readonly selectedAccountBalanceAfter = computed(() => {
    const account = this.selectedAccount();
    const loan = this.entryLoan();
    if (!account || !loan) {
      return 0;
    }
    const amount = this.entryAmount();
    return loan.direction === 'BORROWED'
      ? account.currentBalance - amount
      : account.currentBalance + amount;
  });
  protected readonly selectedAccountBalance = computed(() => this.selectedAccount()?.currentBalance ?? 0);

  protected readonly filteredLoans = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    const filter = this.filter();
    const sort = this.sort();
    return this.store
      .overview()
      .loans.filter((loan) => {
        if (filter === 'BORROWED' && (loan.direction !== 'BORROWED' || loan.status === 'COMPLETED')) {
          return false;
        }
        if (filter === 'LENT' && (loan.direction !== 'LENT' || loan.status === 'COMPLETED')) {
          return false;
        }
        if (filter === 'COMPLETED' && loan.status !== 'COMPLETED') {
          return false;
        }
        if (!query) {
          return true;
        }
        return `${loan.name} ${loan.counterparty}`.toLocaleLowerCase('pt-BR').includes(query);
      })
      .sort((left, right) => {
        switch (sort) {
          case 'REMAINING_DESC':
            return right.remainingAmount - left.remainingAmount;
          case 'REMAINING_ASC':
            return left.remainingAmount - right.remainingAmount;
          case 'NAME_ASC':
            return left.name.localeCompare(right.name, 'pt-BR');
          case 'NAME_DESC':
            return right.name.localeCompare(left.name, 'pt-BR');
          case 'RECENT':
          default:
            return new Date(right.startDate).getTime() - new Date(left.startDate).getTime();
        }
      });
  });

  async ngOnInit(): Promise<void> {
    await this.store.initialize();
  }

  protected openCreate(): void {
    this.loanForm.reset({
      direction: 'BORROWED',
      name: '',
      counterparty: '',
      totalAmount: 0,
      startDate: this.today(),
      hasInstallments: false,
      installmentCount: 1,
      installmentAmount: 0,
      firstDueDate: this.today(),
      interestRate: '',
      notes: '',
    });
    this.showLoanForm.set(true);
  }

  protected closeLoanForm(): void {
    this.showLoanForm.set(false);
  }

  protected openEntry(loan: Loan): void {
    this.entryLoan.set(loan);
    this.entryForm.reset({
      financialAccountId: this.store.activeAccounts()[0]?.id ?? '',
      amount: loan.nextInstallment?.amount ?? loan.remainingAmount,
      occurredOn: this.today(),
    });
  }

  protected closeEntry(): void {
    this.entryLoan.set(null);
  }

  protected async saveLoan(): Promise<void> {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }
    const value = this.loanForm.getRawValue();
    const payload: LoanPayload = {
      name: value.name.trim(),
      direction: value.direction,
      counterparty: value.counterparty.trim(),
      totalAmount: value.totalAmount,
      startDate: value.startDate,
      interestRate: value.interestRate.trim() || undefined,
      notes: value.notes.trim() || undefined,
    };
    if (value.hasInstallments) {
      payload.installmentCount = value.installmentCount;
      payload.installmentAmount = value.installmentAmount > 0
        ? value.installmentAmount
        : this.installmentPreviewAmount();
      payload.firstDueDate = value.firstDueDate;
    }
    if (await this.store.create(payload)) {
      this.closeLoanForm();
    }
  }

  protected async saveEntry(): Promise<void> {
    const loan = this.entryLoan();
    if (!loan || this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }
    const value = this.entryForm.getRawValue();
    const success = await this.store.registerEntry(loan.id, {
      financialAccountId: value.financialAccountId,
      amount: loan.installmentCount ? undefined : value.amount,
      occurredOn: value.occurredOn,
    });
    if (success) {
      this.closeEntry();
    }
  }

  protected async confirmDeletion(): Promise<void> {
    const loan = this.deletingLoan();
    if (loan && (await this.store.delete(loan.id))) {
      this.deletingLoan.set(null);
    }
  }

  protected setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected setFilter(filter: LoanFilter): void {
    this.filter.set(filter);
  }

  protected setSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as LoanSort);
  }

  protected directionLabel(direction: LoanDirection): string {
    return direction === 'BORROWED' ? 'A pagar' : 'A receber';
  }

  protected remainingLabel(direction: LoanDirection): string {
    return direction === 'BORROWED' ? 'Restante' : 'A receber';
  }

  protected actionLabel(loan: Loan): string {
    return loan.direction === 'BORROWED' ? 'Registrar pagamento' : 'Registrar recebimento';
  }

  protected completedCopy(loan: Loan): string {
    if (!loan.installmentCount) {
      return `${loan.entries.length} ${loan.entries.length === 1 ? 'lançamento' : 'lançamentos'}`;
    }
    const suffix = loan.direction === 'BORROWED' ? 'pagas' : 'recebidas';
    return `${loan.completedInstallmentCount} de ${loan.installmentCount} parcelas ${suffix}`;
  }

  protected nextLabel(loan: Loan): string {
    if (!loan.nextInstallment) {
      return loan.installmentCount ? 'Sem próxima parcela' : 'Sem cronograma definido';
    }
    return `${this.shortDate(loan.nextInstallment.dueDate)} · ${this.currency(loan.nextInstallment.amount)}`;
  }

  protected estimatedEndLabel(loan: Loan): string {
    if (!loan.estimatedEndDate) {
      return 'Sem previsão definida';
    }
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
      .format(new Date(`${loan.estimatedEndDate}T00:00:00`));
  }

  protected entryAmount(): number {
    const loan = this.entryLoan();
    if (!loan) {
      return 0;
    }
    return loan.nextInstallment?.amount ?? this.entryForm.controls.amount.value;
  }

  protected statusLabel(status: LoanStatus): string {
    return status === 'COMPLETED' ? 'Quitado' : 'Ativo';
  }

  private shortDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
      .format(new Date(`${date}T00:00:00`))
      .replace('.', '')
      .toLocaleUpperCase('pt-BR');
  }

  private currency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
