// src/app/register/register.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.name || !this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Le mot de passe doit avoir au moins 6 caractères';
      return;
    }

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Erreur lors de l’inscription';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
