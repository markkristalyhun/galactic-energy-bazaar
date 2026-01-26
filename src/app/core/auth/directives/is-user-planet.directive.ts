import { Directive, input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {Role} from '@core/auth/models/role';
import {isEmpty, isNil} from 'lodash-es';

@Directive({
  selector: '[appIsUserPlanet]',
  standalone: true
})
export class IsUserPlanetDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authenticationStore = inject(AuthenticationStore);

  public readonly appIsUserPlanet = input.required<string>();

  constructor() {
    effect(() => {
      const userPlanetId = this.authenticationStore.user()?.planetId;
      const planetIdToCheck = this.appIsUserPlanet();

      if (planetIdToCheck && userPlanetId) {
        this.updateView(planetIdToCheck, userPlanetId);
      }
    });
  }

  private updateView(planetId: string, userPlanetId: string): void {
    this.viewContainer.clear();

    const hasAccess = planetId === userPlanetId;

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
