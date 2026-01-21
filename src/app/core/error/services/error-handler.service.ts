import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslocoService} from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly translateService = inject(TranslocoService);
  private readonly snackBar = inject(MatSnackBar);

  public showError(errorMessage: string) {
    this.snackBar.open(this.translateService.translate(errorMessage), this.translateService.translate('action.close'), {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
