import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService) { }

  onSubmit() {
    this.authService.forgotPassword(this.email).subscribe(
      response => {
        console.log('Reset link sent:', response);
        // Handle success (e.g., show a success message to the user)
      },
      error => {
        console.error('Error sending reset link:', error);
        // Handle error (e.g., show an error message to the user)
      }
    );
  }
}
