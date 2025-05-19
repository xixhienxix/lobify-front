import { AbstractControl, ValidationErrors } from '@angular/forms';

export function nonZeroRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === 0) {
    return null; // 0 is allowed
  }

  if (value === null || value === undefined || value === '') {
    return { required: true };
  }

  return null; // Everything else is valid
}