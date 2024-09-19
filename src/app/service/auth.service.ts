import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';  // Ensure this is correct


  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }
  resetPassword(id: string, token: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password/${id}/${token}`, { password });
  }
  getCurrentUserId(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user && user.id ? user.id : null;
  }
}
