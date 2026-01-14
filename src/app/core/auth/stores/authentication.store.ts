import {UserModel} from '../models/user.model';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject} from '@angular/core';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, of, pipe, switchMap, tap} from 'rxjs';
import {CredentialsModel} from '../models/credentials.model';
import {AuthenticationService} from '../services/authentication.service';

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
  })),
  withMethods((store) => {
    const authenticationService = inject(AuthenticationService);
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
            }
          })
        )
      )
    };
  }),
);
