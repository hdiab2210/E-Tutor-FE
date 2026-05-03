import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ButtonModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly showSearch = input(true);
  readonly auth = inject(AuthService);
  readonly router =inject(Router)

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login'])
  }
}
