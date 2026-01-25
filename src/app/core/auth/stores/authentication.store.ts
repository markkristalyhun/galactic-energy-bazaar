import {UserModel} from '../models/user.model';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject, LOCALE_ID} from '@angular/core';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, of, pipe, switchMap, tap} from 'rxjs';
import {CredentialsModel} from '../models/credentials.model';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {PlanetStore} from '@core/planet/stores/planet.store';
import {CurrencyStore} from '@core/currency/stores/currency.store';
import {TransactionService} from '@core/transaction/services/transaction.service';

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
  withComputed(({user}) => {
    const planetStore = inject(PlanetStore);
    const defaultLocale = inject(LOCALE_ID);

    return {
      isLoggedIn: computed(() => !!user()),
      role: computed(() => user()?.role),
      userLocale: computed(() => {
        const currentUser = user();
        const planets = planetStore.planets();

        if (!currentUser || !planets) {
          return defaultLocale;
        }

        const userPlanet = planets.find(planet => planet.id === currentUser.planetId);
        if (!userPlanet) {
          return defaultLocale;
        }

        return userPlanet.locale;
      })
    };
  }),
  withMethods((store) => {
    const authenticationService = inject(AuthenticationService);
    const router = inject(Router);
    const currencyStore = inject(CurrencyStore);
    const planetStore = inject(PlanetStore);
    const transactionService = inject(TransactionService);

    /**
     * Centralized cleanup for all stores and services when user session ends.
     * This is called during logout, session expiry (401), or component cleanup.
     */
    const cleanupSession = () => {
      // Stop active polling and connections
      currencyStore.stopPolling();
      transactionService.disconnect();

      // Reset all stores to initial state
      currencyStore.reset();
      planetStore.reset();
      transactionService.resetData();

      // Clear authentication state
      patchState(store, {user: null, isLoading: false, error: null});
    };

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
                patchState(store, {isLoading: false, error})
                return of(null);
              })
            )
          ),
          tap(() => {
            cleanupSession();
            router.navigateByUrl('/auth', { replaceUrl: true });
          })
        ),
      ),
      /**
       * Clears the session without calling the backend API.
       * Used when session is already invalid (e.g., 401 response from backend).
       */
      clearSession: () => {
        cleanupSession();
        router.navigateByUrl('/auth', { replaceUrl: true });
      },
      initializeSession: rxMethod<void>(
        pipe(
          tap(() => patchState(store, {isLoading: true, error: null})),
          switchMap(() =>
            authenticationService.checkSession().pipe(
              catchError(() => {
                // Silently fail - user is just not logged in
                patchState(store, {isLoading: false});
                return of(null);
              })
            )
          ),
          tap((result) => {
            if (result) {
              patchState(store, {user: result, isLoading: false});
            } else {
              patchState(store, {isLoading: false});
            }
          })
        )
      )
    };
  }),
);
