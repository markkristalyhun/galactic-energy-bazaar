import {UserModel} from '../models/user.model';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject} from '@angular/core';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, of, pipe, switchMap, tap} from 'rxjs';
import {CredentialsModel} from '../models/credentials.model';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';

interface AuthenticationState {
  user: UserModel | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: AuthenticationState = {
  user: null,
  error: null,
  isLoading: false,
};

export const AuthenticationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({user}) => ({
    isLoggedIn: computed(() => !!user()),
    role: computed(() => user()?.role)
  })),
  withMethods((store) => {
    const authenticationService = inject(AuthenticationService);
    const router = inject(Router);

    return {
      login: rxMethod<CredentialsModel>(
        pipe(
          tap(() => patchState(store, {isLoading: true, error: null})),
          switchMap((credentials) =>
            authenticationService.login(credentials.email, credentials.password).pipe(
              catchError((error) => {
                patchState(store, {isLoading: false, error});
                return of(null);
              })
            )
          ),
          tap((result) => {
            if (result) {
              patchState(store, {user: result, isLoading: false});
              router.navigateByUrl('/dashboard', { replaceUrl: true });
            }
          })
        )
      ),
      logout: rxMethod<void>(
        pipe(
          tap(() => patchState(store, {isLoading: true, error: null})),
          switchMap(() =>
            authenticationService.logout().pipe(
              catchError((error) => {
                patchState(store, {isLoading: false, error, user: null})
                return of(null);
              })
            )
          ),
          tap(() => {
            patchState(store, {user: null, isLoading: false});
            router.navigateByUrl('/auth', { replaceUrl: true });
          })
        ),
      )
    };
  }),
);
