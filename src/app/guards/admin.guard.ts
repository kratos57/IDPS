import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminService } from '../service/admin.service'; // Adjust the path as necessary
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.adminService.getCurrentUserRole().pipe(
      map(role => {
        if (role === 'admin') {
          return true;
        } else {
          this.router.navigate(['/signin']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/sigin']);
        return of(false);
      })
    );
  }
}
