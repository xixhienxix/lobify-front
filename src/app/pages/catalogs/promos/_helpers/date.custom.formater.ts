import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomMaterialDateAdapter extends NativeDateAdapter {
  parse(value: any): Date | null {
    if (typeof value === 'string') {
      const [day, month, year] = value.split(' de '); // Expects '30 de Enero de 2025'
      const monthIndex = this.getMonthIndex(month); // Convert month name to month index
      return new Date(+year, monthIndex, +day); // d de MMMM del yyyy format
    }
    return super.parse(value);
  }

  format(date: Date, displayFormat: Object): string {
    if (date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();
      return `${day} de ${month} del ${year}`; // 30 de Enero del 2025
    }
    return '';
  }

  // Helper method to get the month name in Spanish
  private getMonthName(monthIndex: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex];
  }

  // Helper method to get month index from month name
  private getMonthIndex(monthName: string): number {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months.indexOf(monthName);
  }
}
