import { Component, input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ title() }}</h2>
    <mat-dialog-content>
      <ng-content />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <ng-content select="[actions]" />
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      min-width: 300px;
    }
  `,
})
export class UiDialogComponent {
  title = input.required<string>();
}
