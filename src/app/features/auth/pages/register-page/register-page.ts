import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../services/auth-store';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register-page',
  styleUrl: './register-page.scss',
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authStore = inject(AuthStore);
  protected readonly submitted = signal(false);
  protected readonly error = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(false);
    if (this.form.invalid || this.authStore.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      await this.authStore.register(this.form.getRawValue());
    } catch {
      this.error.set(true);
    }
  }
}
