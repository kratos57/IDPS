import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/adm'; // Update with your backend URL

  constructor(private http: HttpClient) {}
  getCurrentUserRole(): Observable<string> {
    // Replace this with your actual implementation
    const role = localStorage.getItem('userRole'); // Assuming role is stored in local storage
    return of(role || 'user');
  }
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  updateUser(userId: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, user);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
