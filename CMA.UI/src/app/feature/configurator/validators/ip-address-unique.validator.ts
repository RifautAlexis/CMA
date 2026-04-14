import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfiguratorHttp } from '../services/configurator-http';

export function ipAddressUniqueValidator(
  configuratorHttp: ConfiguratorHttp,
  currentIpAddress?: () => string | undefined,
): AsyncValidatorFn {
  return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    const value = control.value?.trim();

    if (!value) {
      return of(null);
    }

    const currentValue = currentIpAddress?.()?.trim();

    if (currentValue === value) {
      return of(null);
    }

    return configuratorHttp.ValidateDeviceIpUniqueness(value).pipe(
      map((response) => {
        return response ? null : { ipAddressNotUnique: true };
      }),
      // Do not block form submission on temporary network/API errors.
      catchError(() => of(null)),
    );
  };
}