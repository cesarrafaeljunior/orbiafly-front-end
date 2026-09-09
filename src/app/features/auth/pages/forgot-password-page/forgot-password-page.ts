import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../services/auth-store';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-forgot-password-page',
  styleUrl: './forgot-password-page.scss',
  templateUrl: './forgot-password-page.html',
})
export class ForgotPasswordPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);
  protected readonly codeRequested = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    login: ['', [Validators.required]],
    code: ['', [Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.minLength(8)]],
  });

  protected async requestCode(): Promise<void> {
    this.submitted.set(true);
    this.error.set(false);
    if (this.form.controls.login.invalid || this.authStore.loading()) {
      this.form.controls.login.markAsTouched();
      return;
    }

    try {
      await this.authStore.requestPasswordReset({ login: this.form.controls.login.value });
      this.codeRequested.set(true);
      this.submitted.set(false);
      this.form.controls.code.addValidators([Validators.required]);
      this.form.controls.newPassword.addValidators([Validators.required]);
      this.form.controls.code.updateValueAndValidity();
      this.form.controls.newPassword.updateValueAndValidity();
    } catch {
      this.error.set(true);
    }
  }

  protected async confirmReset(): Promise<void> {
    this.submitted.set(true);
    this.error.set(false);
    if (this.form.invalid || this.authStore.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const value = this.form.getRawValue();
      await this.authStore.confirmPasswordReset({
        login: value.login,
        code: value.code,
        newPassword: value.newPassword,
      });
      await this.router.navigate(['/login']);
    } catch {
      this.error.set(true);
    }
  }
}
