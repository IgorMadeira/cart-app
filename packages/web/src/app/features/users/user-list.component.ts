import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiPageShellComponent, UiTableComponent, type TableColumn } from '@app001/ui';
import { RelativeDatePipe } from '@app001/ui';
import type { ApiResponse, PaginatedResponse, User } from '@app001/shared';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    UiPageShellComponent,
    UiTableComponent,
    RelativeDatePipe,
  ],
  template: `
    <ui-page-shell title="Users" subtitle="Manage application users">
      <button actions mat-flat-button color="primary">
        <mat-icon>add</mat-icon>
        New User
      </button>

      <ui-table
        [columns]="columns"
        [data]="users()"
        [total]="total()"
        [pageSize]="20"
        (pageChange)="onPage($event)"
      />
    </ui-page-shell>
  `,
})
export class UserListComponent implements OnInit {
  private http = inject(HttpClient);

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  users = signal<User[]>([]);
  total = signal(0);

  ngOnInit() {
    this.loadUsers(1);
  }

  onPage(event: { pageIndex: number; pageSize: number }) {
    this.loadUsers(event.pageIndex + 1, event.pageSize);
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
