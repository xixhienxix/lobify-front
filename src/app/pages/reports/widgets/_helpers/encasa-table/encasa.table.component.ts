import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Huesped } from 'src/app/models/huesped.model';

export interface Reservation {
  reserva: number;
  huesped: string;
  acciones: string;
}

const ELEMENT_DATA: Reservation[] = [
  { reserva: 1, huesped: 'John Doe', acciones: '' },
  { reserva: 2, huesped: 'Jane Smith', acciones: '' },
  { reserva: 3, huesped: 'Michael Johnson', acciones: '' }
];

@Component({
  selector: 'app-encasa-table',
  templateUrl: './encasa.table.component.html',
  styleUrls: ['./encasa.table.component.scss']
})
export class EnCasaTableComponent implements OnInit {
  displayedColumns: string[] = ['reserva', 'huesped', 'acciones'];

  @Input() dataSource: Huesped[] = [];

  constructor() {}

  ngOnInit(): void {}

  formatISODateToCustom(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('es-MX', { month: 'short' }).toLocaleUpperCase();
    const year = date.getFullYear();
  
    return `${day} ${month} ${year}`;
  }

  onButtonClick(event: Event): void {
    event.stopPropagation(); // Prevents the click event from propagating to the panel header
    // Additional button click logic here
  }
}