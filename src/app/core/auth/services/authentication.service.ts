import {inject, Injectable} from '@angular/core';
import {delay, EMPTY, Observable, of} from 'rxjs';
import {UserModel} from '../models/user.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly http = inject(HttpClient);

  public login(email: string, password: string): Observable<UserModel> {
    // return (of(EMPTY) as unknown as Observable<UserModel>).pipe(
    //   delay(5000)
    // );
    throw 'Not implemented function!';
  }
}
