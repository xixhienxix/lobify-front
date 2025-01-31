import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-discount-selector',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule, ReactiveFormsModule],
  templateUrl: './discount-radio-selector.component.html',
  styleUrls: ['./discount-radio-selector.component.scss']
})
export class DiscountSelectorComponent {
    formGroup: FormGroup;
    @Input() showErrors = false;

    @Output() discountChange = new EventEmitter<{ type: string, value: number }>();

    constructor(private fb: FormBuilder) {
        this.formGroup = this.fb.group({
        discountType: ['porcentaje'], // Default selection
        qtyPrecio: [
            null, 
            [Validators.min(1), this.qtyPrecioValidator.bind(this)] // Wrap inside an array
        ]
        });

        this.formGroup.valueChanges.subscribe(() => this.onValueChange());
    }

    qtyPrecioValidator(control: FormControl): { [key: string]: any } | null {
        const discountType = this.formGroup?.get('discountType')?.value;
      
        // Check if the discount type is 'porcentaje' and ensure the value is <= 100
        if (discountType === 'porcentaje' && control.value > 100) {
          return { maxLimit: true }; // Return error if value exceeds 100
        }
      
        return null; // No error
      }
      

    onValueChange() {
        this.discountChange.emit(this.formGroup.value);
    }

    validateForm() {
        this.showErrors = true; // Activate error display
        if (this.formGroup.valid) {
            this.showErrors = false        
        } else {
            this.showErrors = true;
        }
      }
}
