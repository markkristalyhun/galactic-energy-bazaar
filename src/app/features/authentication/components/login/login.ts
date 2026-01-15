import {ChangeDetectionStrategy, Component, inject, Signal, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslocoModule} from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    TranslocoModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authenticationStore = inject(AuthenticationStore);

  public readonly loginForm: FormGroup;
  public readonly isLoading: Signal<boolean> = this.authenticationStore.isLoading;
  public readonly hidePassword = signal(true);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.authenticationStore.login(this.loginForm.value)
    }
  }

  togglePasswordVisibility() {
    this.hidePassword.update(hidePassword => !hidePassword);
  }
}
