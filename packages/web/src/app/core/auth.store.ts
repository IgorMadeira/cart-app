import {
  signalStore,
  withState,
  withMethods,
  patchState,
} from '@ngrx/signals';
import type { User } from '@app001/shared';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
  user: null,
  isAuthenticated: false,
  loading: false,
}),
  withMethods((store) => ({
    setUser(user: User) {
      patchState(store, { user, isAuthenticated: true, loading: false });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    logout() {
      patchState(store, { user: null, isAuthenticated: false, loading: false });
    },
  })),
);
