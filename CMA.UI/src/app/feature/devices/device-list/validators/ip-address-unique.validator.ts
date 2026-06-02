// import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
// import { Observable, of } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { deviceListHttp } from '../services/device-list-http';

// export function ipAddressUniqueValidator(
//   validateDeviceIpUniquenessFn: (ipAddress: string) => Observable<{ isUnique: boolean }>,
//   currentIpAddress?: () => string | undefined,
// ): AsyncValidatorFn {
//   return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
//     const value = control.value?.trim();

//     if (!value) {
//       return of(null);
//     }

//     const currentValue = currentIpAddress?.()?.trim();

//     if (currentValue === value) {
//       return of(null);
//     }

//     return validateDeviceIpUniquenessFn(value).pipe(
//       map((response) => {
//         return response.isUnique ? null : { ipAddressNotUnique: true };
//       }),
//       // Do not block form submission on temporary network/API errors.
//       catchError(() => of(null)),
//     );
//   };
// }

// export function ipAddressUniqueValidator(path: SchemaPath<string>, options?: { message?: string }) {
//   validate(path, ({ value }) => {
//     const value = control.value?.trim();

//     if (!value) {
//       return of(null);
//     }

//     const currentValue = currentIpAddress?.()?.trim();

//     if (currentValue === value) {
//       return of(null);
//     }

//     return validateDeviceIpUniquenessFn(value).pipe(
//       map((response) => {
//         return response.isUnique ? null : { ipAddressNotUnique: true };
//       }),
//       // Do not block form submission on temporary network/API errors.
//       catchError(() => of(null)),
//     );
//   };
// }