import { Component } from '@angular/core';

@Component({
  selector: 'ui-page-shell',
  standalone: true,
  imports: [],
  template: `
    <div class="page-shell">
      <div class="page-actions">
        <ng-content select="[actions]" />
      </div>
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
    .page-actions:empty {
      display: none;
    }
    .page-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .page-content {
      flex: 1;
    }
  `,
})
export class UiPageShellComponent {}
