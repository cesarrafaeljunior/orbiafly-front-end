import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthStore } from '../../services/auth-store';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login-page',
  styleUrl: './login-page.scss',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  protected readonly authStore = inject(AuthStore);
  protected readonly submitted = signal(false);
  protected readonly error = signal(false);
  protected readonly returnUrl = computed(() =>
    this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard',
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(false);
    if (this.form.invalid || this.authStore.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      await this.authStore.login(this.form.getRawValue(), this.returnUrl());
    } catch {
      this.error.set(true);
    }
  }
}
