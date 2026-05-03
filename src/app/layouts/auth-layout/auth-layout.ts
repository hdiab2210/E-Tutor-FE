import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, HeaderComponent, ToastModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
