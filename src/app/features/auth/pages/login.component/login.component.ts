import { Component, inject, signal, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthActions } from '../../../../store/auth/auth.actions';
import { selectIsLoading } from '../../../../store/auth/auth.selectors';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgClass, CheckboxModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly isLoading = this.store.selectSignal(selectIsLoading);
  readonly showPassword = signal(false);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  constructor() {
    this.actions$
      .pipe(ofType(AuthActions.loginFailure, AuthActions.googleLoginFailure), takeUntilDestroyed())
      .subscribe(({ error }) => {
        this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: error, life: 4000 });
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(AuthActions.loginRequest({ payload: this.form.value }));
  }

  signInWithGoogle(): void {
    if (!window.google?.accounts?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Google Sign-In',
        detail: 'Google Sign-In SDK not loaded. Please refresh the page.',
        life: 4000,
      });
      return;
    }

    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response) => this.store.dispatch(AuthActions.googleLoginRequest({ token: response.credential })),
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Google Sign-In',
          detail: 'Google sign-in popup was dismissed.',
          life: 3000,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(AuthActions.clearError());
  }
}
