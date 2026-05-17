import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiPageShellComponent, UiTableComponent, HasPermissionDirective, type TableColumn } from '@app001/ui';
import { RelativeDatePipe } from '@app001/ui';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@app001/shared';
import type { ApiResponse, PaginatedResponse, User, Role } from '@app001/shared';
import { PageHeaderService } from '../../core/page-header.service';
import { AuthStore } from '../../core/auth.store';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    UiPageShellComponent,
    UiTableComponent,
    RelativeDatePipe,
    HasPermissionDirective,
  ],
  template: `
    <ui-page-shell>
      <button
        actions
        *uiHasPermission="PERMISSIONS.USERS_WRITE; permissions: userPermissions()"
        mat-flat-button
        color="primary"
        (click)="navigateToCreate()"
      >
        <mat-icon>add</mat-icon>
        New User
      </button>

      <ui-table
        [columns]="columns"
        [data]="users()"
        [total]="total()"
        [pageSize]="20"
        (pageChange)="onPage($event)"
      >
        <ng-template #cellTpl let-row let-column="column">
          @switch (column) {
            @case ('createdAt') {
              {{ row.createdAt | relativeDate }}
            }
            @case ('actions') {
              <button
                *uiHasPermission="PERMISSIONS.USERS_WRITE; permissions: userPermissions()"
                mat-icon-button
                class="action-edit"
                (click)="navigateToEdit(row.id)"
                aria-label="Edit user"
              >
                <mat-icon>edit</mat-icon>
              </button>
            }
            @default {
              {{ row[column] }}
            }
          }
        </ng-template>
      </ui-table>
    </ui-page-shell>
  `,
})
export class UserListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private pageHeader = inject(PageHeaderService);
  private authStore = inject(AuthStore);

  readonly PERMISSIONS = PERMISSIONS;

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: '' },
  ];

  users = signal<User[]>([]);
  total = signal(0);

  userPermissions = () => {
    const user = this.authStore.user();
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role as Role] ?? [];
  };

  ngOnInit() {
    this.pageHeader.set({ title: 'Users', subtitle: 'Manage application users' });
    this.loadUsers(1);
  }

  onPage(event: { pageIndex: number; pageSize: number }) {
    this.loadUsers(event.pageIndex + 1, event.pageSize);
  }

  navigateToCreate() {
    this.router.navigate(['/users/new']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/users', id, 'edit']);
  }

  private loadUsers(page: number, pageSize = 20) {
    this.http
      .get<ApiResponse<PaginatedResponse<User>>>(`/api/users?page=${page}&pageSize=${pageSize}`)
      .subscribe((res) => {
        if (res.success && res.data) {
          this.users.set(res.data.items);
          this.total.set(res.data.total);
        }
      });
  }
}
