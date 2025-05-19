import { AbstractControl, ValidationErrors } from "@angular/forms";

export function alphanumericValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
  
    if (value && !/^[A-Z0-9]+$/.test(value)) {
      return { invalidCharacters: true };
    }
  
    return null;
  }
  