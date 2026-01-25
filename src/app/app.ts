import {Component, effect, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslocoService} from '@jsverse/transloco';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly authenticationStore = inject(AuthenticationStore);
  private readonly translocoService = inject(TranslocoService);

  constructor() {
    // Initialize session on app load
    this.authenticationStore.initializeSession();

    effect(() => {
      const isLoggedIn = this.authenticationStore.isLoggedIn();
      const userLocale = this.authenticationStore.userLocale();
      if (!isLoggedIn || !userLocale) {
        this.resetActiveLanguageIfNecessary();
        return;
      }

      const languageCode = userLocale.split('-')?.[0];
      if (languageCode) {
        this.translocoService.setActiveLang(languageCode);
      }
    });
  }

  private resetActiveLanguageIfNecessary() {
    const activeLanguage = this.translocoService.getActiveLang();
    if (activeLanguage !== this.translocoService.getDefaultLang()) {
      this.translocoService.setActiveLang(this.translocoService.getDefaultLang());
    }
  }
}
