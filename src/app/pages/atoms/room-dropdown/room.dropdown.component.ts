import { Component, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { OverlayContainer } from '@angular/cdk/overlay';
import { listaCamas } from '../../catalogs/promos/promo.component';

@Component({
  selector: 'app-camas-select',
  standalone: true,
  templateUrl: './room.dropdown.component.html',
  styleUrls: ['./room.dropdown.component.scss'],
  imports: [CommonModule, MatSelectModule, MatOptionModule, MatButtonModule, ReactiveFormsModule]
})
export class CamasSelectComponent {
  camasFC: FormControl = new FormControl([]);
  @ViewChild('camasSelect') camasSelect!: MatSelect;
  @Input() disponiblesIndexadosCamas: listaCamas[] = [];
  @Output() selectionChanged = new EventEmitter<string[]>();  // Emit selected values (string array)
  
  
  camaFCVacio = signal(false);

  constructor(    private overlayContainer: OverlayContainer
  ){}

  preventCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.add('disable-backdrop-click');
  }

  allowCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.remove('disable-backdrop-click');
  }

  camasValue(value: string) {
    // Filter out the removed value from the selected values array
    this.camasFC.setValue(this.camasFC.value.filter((item: string) => item !== value));
    this.emitSelectionChanged();
  }

  selectionChange() {
    this.emitSelectionChanged();
  }

  private emitSelectionChanged() {
    // Emit the selected values from camasFC to the parent
    this.selectionChanged.emit(this.camasFC.value);
  }
}