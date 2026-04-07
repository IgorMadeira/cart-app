import {
  Component,
  input,
  output,
  contentChild,
  TemplateRef,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { NgTemplateOutlet } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, NgTemplateOutlet],
  template: `
    <div class="ui-table-wrapper">
      <table mat-table [dataSource]="data()" matSort (matSortChange)="onSort($event)">
        @for (col of columns(); track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef [mat-sort-header]="col.sortable ? col.key : ''">
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @if (cellTemplate()) {
                <ng-container
                  *ngTemplateOutlet="cellTemplate()!; context: { $implicit: row, column: col.key }"
                />
              } @else {
                {{ row[col.key] }}
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="columnKeys()"></tr>
        <tr mat-row *matRowDef="let row; columns: columnKeys()"></tr>
      </table>

      @if (showPaginator()) {
        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
      }
    </div>
  `,
  styles: `
    .ui-table-wrapper {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
  `,
})
export class UiTableComponent<T = unknown> {
  columns = input.required<TableColumn[]>();
  data = input.required<T[]>();
  total = input(0);
  pageSize = input(20);
  showPaginator = input(true);

  cellTemplate = contentChild<TemplateRef<unknown>>('cellTpl');

  pageChange = output<PageEvent>();
  sortChange = output<Sort>();

  columnKeys = () => this.columns().map((c) => c.key);

  onPage(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSort(event: Sort) {
    this.sortChange.emit(event);
  }
}
