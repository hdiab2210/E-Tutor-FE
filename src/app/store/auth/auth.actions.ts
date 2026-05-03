import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SignUpPayload, SignUpResponse, LoginPayload } from './auth.reducer';
import { User } from '../../core/services/auth.service';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Sign Up': props<{ payload: SignUpPayload }>(),
    'Sign Up Success': props<{ response: SignUpResponse }>(),
    'Sign Up Failure': props<{ error: string }>(),

    'Google Sign Up': props<{ token: string }>(),
    'Google Sign Up Success': props<{ response: SignUpResponse }>(),
    'Google Sign Up Failure': props<{ error: string }>(),

    'Login Request': props<{ payload: LoginPayload }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),

    'Google Login Request': props<{ token: string }>(),
    'Google Login Success': props<{ user: User }>(),
    'Google Login Failure': props<{ error: string }>(),

    'Login': props<{ user: User }>(),
    'Logout': emptyProps(),
    'Clear Error': emptyProps(),
    'Token Refreshed': props<{ token: string; refreshToken: string }>(),
  },
});
