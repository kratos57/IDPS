import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../service/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  user: any = {
    username: '',
    email: '',
    role: 'user'
  };
  isEditMode: boolean = false;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.isEditMode = true;
      this.adminService.getAllUsers().subscribe((data) => {
        this.user = data.find((user: any) => user._id === userId);
      });
    }
  }

  saveUser(): void {
    if (this.isEditMode) {
      this.adminService.updateUser(this.user._id, this.user).subscribe(() => {
        this.router.navigate(['/admin/users']);
      });
    } else {
      this.adminService.addUser(this.user).subscribe(() => {
        this.router.navigate(['/admin/users']);
      });
    }
  }
}
