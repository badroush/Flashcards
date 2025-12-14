// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // ✅ Ajout du rôle
}

export interface AuthResponse {
  status: string;
  data: User;
  token: string;
}

// Réponse brute du backend (avec "user")
interface RawAuthResponse {
  status: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  currentUserValue: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadToken();
  }

  // Charge le token et l'utilisateur au démarrage
  private loadToken() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          this.currentUserSubject.next(user);
        } else {
          this.clearStorage();
        }
      } catch (e) {
        this.clearStorage();
      }
    }
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Vérifie si l'utilisateur est ADMIN
  get isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }

  // Dans les méthodes
register(name: string, email: string, password: string): Observable<AuthResponse> {
  return this.http.post<RawAuthResponse>(`${this.apiUrl}/register`, {
    name, email, password
  }).pipe(
    map((response: RawAuthResponse) => { // ✅ Typage explicite
      const adapted: AuthResponse = {
        status: response.status,
         data:response.user,
        token: response.token
      };
      this.setSession(adapted);
      return adapted;
    })
  );
}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<RawAuthResponse>(`${this.apiUrl}/login`, {
      email, password
    }).pipe(
      map((response: RawAuthResponse) => { // ✅ Typage explicite
        const adapted: AuthResponse = {
          status: response.status,
          data:response.user,
          token: response.token
        };
        this.setSession(adapted);
        return adapted;
      })
    );
  }

  logout() {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.data));
    this.currentUserSubject.next(authResult.data);
  }

  private clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
