import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./features/users/user-form.component').then(
            (m) => m.UserFormComponent,
          ),
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./features/users/user-form.component').then(
            (m) => m.UserFormComponent,
          ),
      },
      {
        path: 'document-models',
        loadComponent: () =>
          import('./features/document-models/document-model-list.component').then(
            (m) => m.DocumentModelListComponent,
          ),
      },
      {
        path: 'document-models/new',
        loadComponent: () =>
          import('./features/document-models/document-model-form.component').then(
            (m) => m.DocumentModelFormComponent,
          ),
      },
      {
        path: 'document-models/:id/edit',
        loadComponent: () =>
          import('./features/document-models/document-model-form.component').then(
            (m) => m.DocumentModelFormComponent,
          ),
      },
      {
        path: 'documents/create',
        loadComponent: () =>
          import('./features/documents/create-document.component').then(
            (m) => m.CreateDocumentComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
