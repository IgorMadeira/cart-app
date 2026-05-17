import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageHeaderService {
  readonly title = signal('');
  readonly subtitle = signal('');
  readonly showBack = signal(false);
  readonly backRoute = signal<string | undefined>(undefined);

  set(options: { title: string; subtitle?: string; showBack?: boolean; backRoute?: string }) {
    this.title.set(options.title);
    this.subtitle.set(options.subtitle ?? '');
    this.showBack.set(options.showBack ?? false);
    this.backRoute.set(options.backRoute);
  }

  clear() {
    this.title.set('');
    this.subtitle.set('');
    this.showBack.set(false);
    this.backRoute.set(undefined);
  }
}
