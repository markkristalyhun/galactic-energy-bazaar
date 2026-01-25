import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UserModel} from '../models/user.model';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.apiUrl;

  public login(email: string, password: string): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.baseUrl}/login`, {email, password});
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, null);
  }

  public checkSession(): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.baseUrl}/session`, {
      headers: { 'X-Skip-Error-Handler': 'true' }
    });
  }
}
