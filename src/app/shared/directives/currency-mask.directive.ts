import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  minimumFractionDigits: 2,
  style: 'currency',
});

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyMaskDirective),
    },
  ],
  selector: 'input[appCurrencyMask]',
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  readonly allowNegative = input(false, { alias: 'appCurrencyAllowNegative' });

  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @HostListener('input', ['$event'])
  protected handleInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement).value;
    const value = this.parseCurrencyValue(rawValue);
    this.onChange(value);
    this.writeFormattedValue(value);
  }

  @HostListener('blur')
  protected handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.writeFormattedValue(value ?? 0);
  }

  registerOnChange(onChange: (value: number) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  private parseCurrencyValue(rawValue: string): number {
    const digits = rawValue.replace(/\D/g, '');
    const isNegative = this.allowNegative() && rawValue.includes('-');
    const cents = Number(digits || '0');
    const value = cents / 100;

    return isNegative ? value * -1 : value;
  }

  private writeFormattedValue(value: number): void {
    this.renderer.setProperty(
      this.elementRef.nativeElement,
      'value',
      currencyFormatter.format(value),
    );
  }
}
