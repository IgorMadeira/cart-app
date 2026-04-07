import {
  Directive,
  input,
  inject,
  TemplateRef,
  ViewContainerRef,
  effect,
} from '@angular/core';

/**
 * Structural directive that shows/hides content based on user permissions.
 *
 * Usage:
 *   <div *uiHasPermission="'users:write'; permissions: currentPermissions">
 *     Only visible if user has 'users:write'
 *   </div>
 */
@Directive({
  selector: '[uiHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  uiHasPermission = input.required<string>();
  uiHasPermissionPermissions = input<string[]>([]);

  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  constructor() {
    effect(() => {
      const required = this.uiHasPermission();
      const userPerms = this.uiHasPermissionPermissions();
      const shouldShow = userPerms.includes(required);

      if (shouldShow && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!shouldShow && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
