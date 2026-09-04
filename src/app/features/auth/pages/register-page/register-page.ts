import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSession } from '../../../../core/auth/auth-session';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register-page',
  styleUrl: '../login-page/login-page.scss',
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly submitting = signal(false);

  protected readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(160)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(4)] }),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.session.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Conta criada com sucesso.');
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.toast.error('Não foi possível criar sua conta.');
        this.submitting.set(false);
      },
    });
  }
}
