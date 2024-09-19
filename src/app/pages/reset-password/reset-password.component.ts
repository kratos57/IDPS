import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  private userId!: string;
  private token!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the user ID and token from the URL
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.token = params['token'];
    });
  }

  onSubmit(): void {
    this.authService.resetPassword(this.userId, this.token, this.password).subscribe(
      response => {
        console.log('Password reset successful:', response);
        // Redirect to login or another page
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Password reset failed:', error);
        // Handle error (e.g., show an error message to the user)
      }
    );
  }
}
