import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SchemaPath, validate } from '@angular/forms/signals';

const IP_ADDRESS_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/;

export function ipAddressFormatValidator(path: SchemaPath<string>, options?: { message?: string }) {
  validate(path, ({ value }) => {
    if (!value()) {
      return null;
    }

    return IP_ADDRESS_REGEX.test(value())
      ? null
      : {
          kind: 'ipAddressFormat',
          message: 'IP Address must be in a valid format.',
        };
  });
}
