import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterOutlet} from "@angular/router";
import {AuthenticationStore} from '@core/auth/stores/authentication.store';

@Component({
  selector: 'app-home',
    imports: [
        MatIcon,
        MatIconButton,
        MatToolbar,
        RouterOutlet
    ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly authenticationStore = inject(AuthenticationStore);

  public onLogout() {
    this.authenticationStore.logout();
  }
}
