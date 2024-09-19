import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminGuard } from './admin.guard';
import { AdminService } from '../service/admin.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let adminService: AdminService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        {
          provide: AdminService,
          useValue: {
            getCurrentUserRole: () => of('admin') // Mocked admin role
          }
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') } // Mocked Router
        }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    adminService = TestBed.inject(AdminService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if user is admin', (done: DoneFn) => {
    guard.canActivate().subscribe(canActivate => {
      expect(canActivate).toBeTrue();
      done();
    });
  });

  it('should deny access and redirect if user is not admin', (done: DoneFn) => {
    // Mocking getCurrentUserRole to return non-admin role
    spyOn(adminService, 'getCurrentUserRole').and.returnValue(of('user'));
    guard.canActivate().subscribe(canActivate => {
      expect(canActivate).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/main']);
      done();
    });
  });
});
