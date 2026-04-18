import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { AuthService } from './core/auth.service';
import { AuthStore } from './core/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        const authStore = inject(AuthStore);
        return () =>
          firstValueFrom(
            authService.getMe().pipe(
              tap((res) => {
                if (res.data) authStore.setUser(res.data);
              }),
              catchError(() =>
                authService.refreshToken().pipe(
                  tap((res) => {
                    if (res.data) authStore.setUser(res.data.user);
                  }),
                  catchError(() => of(null)),
                ),
              ),
            ),
          );
      },
      multi: true,
    },
  ],
};
