import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { UiDialogComponent } from '../ui-dialog/ui-dialog.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, UiDialogComponent],
  template: `
    <ui-dialog [title]="data.title">
      <p>{{ data.message }}</p>
      <ng-container actions>
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-flat-button color="warn" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </ng-container>
    </ui-dialog>
  `,
})
export class UiConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<UiConfirmDialogComponent>);

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
