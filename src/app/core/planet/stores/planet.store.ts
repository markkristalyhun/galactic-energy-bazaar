import {PlanetModel, PlanetSimpleModel} from '@core/planet/models/planet.model';
import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {inject} from '@angular/core';
import {PlanetService} from '@core/planet/services/planet.service';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {catchError, of, pipe, switchMap, tap} from 'rxjs';

interface PlanetState {
  planets: PlanetSimpleModel[];
  planetInfo: PlanetModel | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlanetState = {
  planets: [],
  planetInfo: null,
  isLoading: false,
  error: null,
};

export const PlanetStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store) => {
    const planetService = inject(PlanetService);

    return {
      loadPlanets: rxMethod<void>(
        pipe(
          tap(() => patchState(store, {isLoading: true, error: null})),
          switchMap(() =>
            planetService.loadPlanets().pipe(
              catchError((error) => {
                patchState(store, {isLoading: false, error});
                return of([]);
              })
            )
          ),
          tap((result) => {
            if (result) {
              patchState(store, {planets: result, isLoading: false});
            }
          })
        )
      ),
      loadPlanetById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, {isLoading: true, error: null})),
          switchMap((planetId) =>
            planetService.loadPlanetById(planetId).pipe(
              catchError((error) => {
                patchState(store, {isLoading: false, error});
                return of(null);
              })
            )
          ),
          tap((result) => {
            if (result) {
              patchState(store, {planetInfo: result, isLoading: false});
            }
          })
        )
      ),
      reset: () => {
        patchState(store, initialState);
      },
    };
  })
);
