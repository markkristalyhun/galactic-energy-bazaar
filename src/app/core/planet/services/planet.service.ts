import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {PlanetModel} from '@core/planet/models/planet.model';

@Injectable({
  providedIn: 'root',
})
export class PlanetService {
  private readonly http = inject(HttpClient);

  public loadPlanets(): Observable<PlanetModel[]> {
    return this.http.get<PlanetModel[]>('/api/planets');
  }
}
