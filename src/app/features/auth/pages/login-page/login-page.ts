import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSession } from '../../../../core/auth/auth-session';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login-page',
  styleUrl: './login-page.scss',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly submitting = signal(false);

  protected readonly form = new FormGroup({
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.session.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Login realizado com sucesso.');
        this.router.navigateByUrl(this.router.parseUrl(this.router.url).queryParams['redirectTo'] ?? '/dashboard');
      },
      error: () => {
        this.toast.error('Não foi possível entrar. Confira suas credenciais.');
        this.submitting.set(false);
      },
    });
  }
}
