import { Component, inject, signal, OnDestroy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
import { SignUpPayload } from '../../../../store/auth/auth.reducer';
import { environment } from '../../../../../environments/environment';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-sign-up',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgClass,
    CheckboxModule,
    InputTextModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly isLoading = this.store.selectSignal(selectIsLoading);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      termsAgreed: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    this.actions$
      .pipe(ofType(AuthActions.signUpSuccess, AuthActions.googleSignUpSuccess), takeUntilDestroyed())
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Account Created',
          detail: 'Your account has been created successfully!',
          life: 3000,
        });
      });

    this.actions$
      .pipe(ofType(AuthActions.signUpFailure, AuthActions.googleSignUpFailure), takeUntilDestroyed())
      .subscribe(({ error }) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Sign Up Failed',
          detail: error,
          life: 4000,
        });
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
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

    const { termsAgreed: _t, ...payload } = this.form.value as { termsAgreed: boolean } & SignUpPayload;
    this.store.dispatch(AuthActions.signUp({ payload }));
  }

  signUpWithGoogle(): void {
    if (!window.google?.accounts?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Google Sign-Up',
        detail: 'Google Sign-In SDK not loaded. Please refresh the page.',
        life: 4000,
      });
      return;
    }

    window.google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response) => this.handleGoogleCredential(response.credential),
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Google Sign-Up',
          detail: 'Google sign-in popup was dismissed.',
          life: 3000,
        });
      }
    });
  }

  private handleGoogleCredential(token: string): void {
    this.store.dispatch(AuthActions.googleSignUp({ token }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(AuthActions.clearError());
  }
}
