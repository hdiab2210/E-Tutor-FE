import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component/login.component';
import { SignUpComponent } from './pages/sign-up.component/sign-up.component';

export const AUTH_ROUTES: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signUp',
        component: SignUpComponent
    }
];