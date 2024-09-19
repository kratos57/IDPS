import { Routes } from '@angular/router';
import { SignInFormComponent } from './pages/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './pages/sign-up-form/sign-up-form.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ForgotPasswordComponent } from './pages/forget-password/forget-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { UserListComponent } from './pages/admin/user-list/user-list.component';
import { UserFormComponent } from './pages/admin/user-form/user-form.component';
import { AdminGuard } from './guards/admin.guard';
import { FileUploadComponent } from './file-upload/file-upload.component';

export const routes: Routes = [
  { path: '', redirectTo: '/signin', pathMatch: 'full' },
  { path: 'signup', component: SignUpFormComponent },
  { path: 'signin', component: SignInFormComponent },
  { path: 'main'  , component: MainPageComponent},
  { path: 'forgot-password'  , component: ForgotPasswordComponent},
  { path: 'reset-password/:id/:token', component: ResetPasswordComponent },
  { path: 'admin/user-form', component: UserFormComponent },
  { path: 'admin/users', component: UserListComponent, canActivate: [AdminGuard] },
  { path: 'admin/user-form/:id', component: UserFormComponent, canActivate: [AdminGuard] },
  { path: 'upload'  , component: FileUploadComponent},

];


export class AppRoutingModule { }
