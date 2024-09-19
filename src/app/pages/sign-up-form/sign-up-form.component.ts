import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Import FormsModule

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  imports: [FormsModule],  // Add FormsModule here
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    if (this.password !== this.confirmPassword) {
      console.error('Passwords do not match');
      return; // Prevent registration if passwords do not match
    }

    const userData = { username: this.username, email: this.email, password: this.password };

    this.authService.register(userData).subscribe(
      response => {
        console.log('Registration successful', response);
        this.router.navigate(['/signin']);
      },
      error => {
        console.error('Registration error', error);
        alert(`Registration failed: ${error.error.message}`);  // Show error message to user
      }
    );
  }
}
