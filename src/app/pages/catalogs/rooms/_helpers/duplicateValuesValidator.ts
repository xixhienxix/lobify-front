import { AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

// Custom validator to check for duplicate values in the FormArray
export function duplicateValuesValidator(): ValidatorFn {
    return (formArray: AbstractControl): { [key: string]: boolean } | null => {
        const controls = (formArray as FormArray).controls; // Get the controls in the FormArray
        const values = controls.map(control => control.value); // Extract values from the controls

        // Create an object to track the count of each value
        const valueCount: { [key: string]: number } = {};

        // Count occurrences of each value
        for (const value of values) {
            if (value) {
                valueCount[value] = (valueCount[value] || 0) + 1;
            }
        }

        // Check for duplicates
        let hasDuplicates = false;

        controls.forEach(control => {
            if (control.value && valueCount[control.value] > 1) {
                control.setErrors({ duplicate: true }); // Set error if duplicate found
                hasDuplicates = true;
            } else {
                control.setErrors(null); // Clear any previous errors
            }
        });

        return hasDuplicates ? { duplicates: true } : null; // Return an error if duplicates are found
    };
}
