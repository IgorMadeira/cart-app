import { Component, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'ui-page-shell',
  standalone: true,
  imports: [MatToolbarModule],
  template: `
    <div class="page-shell">
      <mat-toolbar color="primary" class="page-header">
        <span>{{ title() }}</span>
        <span class="spacer"></span>
        <ng-content select="[actions]" />
      </mat-toolbar>

      @if (subtitle()) {
        <p class="page-subtitle">{{ subtitle() }}</p>
      }

      <div class="page-content">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .page-shell {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .page-header {
      flex-shrink: 0;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .page-subtitle {
      padding: 8px 16px 0;
      margin: 0;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
    }
    .page-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }
  `,
})
export class UiPageShellComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
}
