import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CurrencyMaskDirective } from './currency-mask.directive';

@Component({
  imports: [CurrencyMaskDirective, ReactiveFormsModule],
  template: `
    <input appCurrencyMask [formControl]="amount" />
    <input appCurrencyMask [appCurrencyAllowNegative]="true" [formControl]="balance" />
  `,
})
class CurrencyMaskHost {
  readonly amount = new FormControl(0, { nonNullable: true });
  readonly balance = new FormControl(0, { nonNullable: true });
}

describe('CurrencyMaskDirective', () => {
  async function setup(): Promise<ComponentFixture<CurrencyMaskHost>> {
    await TestBed.configureTestingModule({ imports: [CurrencyMaskHost] }).compileComponents();
    const fixture = TestBed.createComponent(CurrencyMaskHost);
    fixture.detectChanges();
    return fixture;
  }

  it('formats typed cents as BRL and keeps the form value numeric', async () => {
    const fixture = await setup();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '12345';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.amount.value).toBe(123.45);
    expect(normalizeCurrency(input.value)).toBe('R$ 123,45');
  });

  it('supports negative balances when enabled', async () => {
    const fixture = await setup();
    const input = fixture.nativeElement.querySelectorAll('input')[1] as HTMLInputElement;

    input.value = '-500';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.balance.value).toBe(-5);
    expect(normalizeCurrency(input.value)).toBe('-R$ 5,00');
  });

  function normalizeCurrency(value: string): string {
    return value.replace(/\s/u, ' ');
  }
});
