import { Directive, input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import {AuthenticationStore} from '@core/auth/stores/authentication.store';
import {Role} from '@core/auth/models/role';
import {isEmpty, isNil} from 'lodash-es';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authenticationStore = inject(AuthenticationStore);

  public readonly appHasRole = input.required<Role[]>();

  constructor() {
    effect(() => {
      this.updateView(this.appHasRole(), this.authenticationStore.role());
    });
  }

  private updateView(acceptedRoles: readonly Role[], userRole: Role | undefined): void {
    this.viewContainer.clear();

    if (isEmpty(acceptedRoles) || isNil(userRole)) {
      return;
    }

    const hasAccess = acceptedRoles.includes(userRole);

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
