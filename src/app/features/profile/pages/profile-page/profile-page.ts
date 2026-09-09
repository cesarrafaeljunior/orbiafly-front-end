import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../../auth/services/auth-store';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-profile-page',
  styleUrl: './profile-page.scss',
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authStore = inject(AuthStore);
  protected readonly submitted = signal(false);
  protected readonly error = signal(false);
  protected readonly user = this.authStore.user;

  protected readonly form = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected passwordsDoNotMatch(): boolean {
    const value = this.form.getRawValue();
    return Boolean(
      value.newPassword && value.confirmPassword && value.newPassword !== value.confirmPassword,
    );
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(false);
    if (this.form.invalid || this.passwordsDoNotMatch() || this.authStore.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const value = this.form.getRawValue();
      await this.authStore.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });
      this.submitted.set(false);
      this.form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      this.error.set(true);
    }
  }
}
