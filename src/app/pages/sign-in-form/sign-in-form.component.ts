import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null; // Add error message handling

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        console.log('Login successful', response);

        if (response && response.token) {
          localStorage.setItem('token', response.token);

          // Store the username
          const username = response.user?.username || 'unknown';
          localStorage.setItem('username', username);

          // Handle user role and navigation
          const userRole = response.user?.role || 'user';
          localStorage.setItem('userRole', userRole);

          if (userRole === 'admin') {
            this.router.navigate(['/admin/users']);
          } else {
            this.router.navigate(['/main']);
          }
        } else {
          this.errorMessage = 'Invalid response structure from the server.';
        }
      },
      error => {
        console.error('Login error', error);
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
      }
    );
  }
}
