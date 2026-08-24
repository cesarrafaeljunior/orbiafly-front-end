import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseForm } from './expense-form';

describe('ExpenseForm', () => {
  async function setup(): Promise<ComponentFixture<ExpenseForm>> {
    await TestBed.configureTestingModule({ imports: [ExpenseForm] }).compileComponents();
    const fixture = TestBed.createComponent(ExpenseForm);
    fixture.componentRef.setInput('categories', [{ id: 'category-home', name: 'Casa' }]);
    fixture.detectChanges();
    return fixture;
  }

  it('blocks an incomplete expense and emits a valid payload', async () => {
    const fixture = await setup();
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(saved).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Informe um nome');

    setInput(element, 'input[formControlName="name"]', 'Energia');
    setInput(element, 'input[formControlName="defaultAmount"]', '200');
    setInput(element, 'input[formControlName="dueDay"]', '18');
    setInput(element, 'select[formControlName="categoryId"]', 'category-home');
    form.dispatchEvent(new Event('submit'));

    expect(saved).toHaveBeenCalledWith({
      name: 'Energia',
      defaultAmount: 200,
      dueDay: 18,
      categoryId: 'category-home',
      active: true,
    });
  });

  it('fills the recurring configuration when editing', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('expense', {
      occurrenceId: 'occurrence-1',
      fixedExpenseId: 'expense-1',
      name: 'Internet',
      amount: 76.9,
      defaultAmount: 89.9,
      dueDay: 12,
      categoryId: 'category-home',
      category: 'Casa',
      status: 'PENDING',
      paidAt: null,
      active: false,
    });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect((element.querySelector('input[formControlName="name"]') as HTMLInputElement).value).toBe(
      'Internet',
    );
    expect(
      (element.querySelector('input[formControlName="defaultAmount"]') as HTMLInputElement).value,
    ).toBe('89.9');
    expect(
      (element.querySelector('input[formControlName="active"]') as HTMLInputElement).checked,
    ).toBe(false);
    expect(element.textContent).toContain('Editar despesa fixa');
  });

  function setInput(root: HTMLElement, selector: string, value: string): void {
    const control = root.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
    control.value = value;
    control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
  }
});
