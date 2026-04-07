import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @switch (variant()) {
      @case ('raised') {
        <button mat-raised-button [color]="color()" [disabled]="disabled()">
          @if (icon()) { <mat-icon>{{ icon() }}</mat-icon> }
          <ng-content />
        </button>
      }
      @case ('stroked') {
        <button mat-stroked-button [color]="color()" [disabled]="disabled()">
          @if (icon()) { <mat-icon>{{ icon() }}</mat-icon> }
          <ng-content />
        </button>
      }
      @default {
        <button mat-flat-button [color]="color()" [disabled]="disabled()">
          @if (icon()) { <mat-icon>{{ icon() }}</mat-icon> }
          <ng-content />
        </button>
      }
    }
  `,
})
export class UiButtonComponent {
  variant = input<'raised' | 'flat' | 'stroked'>('flat');
  color = input<'primary' | 'accent' | 'warn'>('primary');
  icon = input<string | undefined>(undefined);
  disabled = input(false);
}
