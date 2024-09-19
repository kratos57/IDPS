import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../service/admin.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule,CommonModule ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})


export class UserListComponent implements OnInit {
  users: any[] = []; // Initialize an empty array for users

  constructor(private router: Router, private adminservice: AdminService) {}

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.adminservice.getAllUsers().subscribe(
      (data: any[]) => {
        this.users = data; // Store the fetched users
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
  }

  editUser(userId: string) {
    this.router.navigate(['/admin/user-form', userId]);
  }


  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminservice.deleteUser(userId).subscribe(
        () => {
          // Successfully deleted
          this.users = this.users.filter(user => user._id !== userId);
          alert('User deleted successfully.');
        },
        (error) => {
          // Handle error
          console.error('Error deleting user', error);
          alert('Failed to delete user.');
        }
      );
    }
  }
}
