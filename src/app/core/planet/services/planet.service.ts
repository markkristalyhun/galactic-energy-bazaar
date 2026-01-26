import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {PlanetModel, PlanetSimpleModel} from '@core/planet/models/planet.model';
import {environment} from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class PlanetService {
  private readonly http = inject(HttpClient);

  public loadPlanets(): Observable<PlanetSimpleModel[]> {
    return this.http.get<PlanetModel[]>(`${environment.apiUrl}/planets`);
  }

  public loadPlanetById(planetId: string): Observable<PlanetModel | null> {
    return this.http.get<PlanetModel>(`${environment.apiUrl}/planets/${planetId}`);
  }
}
