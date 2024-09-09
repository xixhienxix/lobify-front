import { Component, OnInit } from '@angular/core';
import { ActivityLogs } from 'src/app/models/activity-log.model';
import { AuthService } from 'src/app/modules/auth';
import { LogService } from 'src/app/services/activity-logs.service';

@Component({
  selector: 'app-activity-drawer',
  templateUrl: './activity-drawer.component.html',
})
export class ActivityDrawerComponent implements OnInit {
  logs: ActivityLogs[] = [];
  filteredLogs: ActivityLogs[] = [];
  currentUser: string;
  searchTerm: string = '';


  constructor(private _logService: LogService, private _authService: AuthService) {
    this.currentUser = this._authService.getUserInfo().username;
  }

  ngOnInit() {
    this.fetchLogs();
    this.subscribeToUserLogs();
  }

  fetchLogs() {
    this._logService.getLogs(this.currentUser).subscribe({
      next: (logs) => {
        // Ordenar los logs por timestamp
        this.logs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.filterLogs(); // Filter logs after fetching

      },
      error: (error) => {
        console.error('Failed to fetch logs:', error);
      }
    });
  }

  filterLogs() {
    this.filteredLogs = this.logs.filter(log =>
      log.folio?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  subscribeToUserLogs() {
    this._logService.userLogs$.subscribe({
      next: (logs) => {
        // Ordenar los logs por timestamp
        this.logs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      error: (error) => {
        console.error('Failed to fetch logs from BehaviorSubject:', error);
      }
    });
  }

  getPropertiesChangedArray(log: ActivityLogs): [string, any][] {
    const flattenProperties = (obj: any, parentKey = ''): [string, any][] => {
      let entries: [string, any][] = [];
      for (const [key, value] of Object.entries(obj)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          entries = entries.concat(flattenProperties(value, newKey));
        } else {
          entries.push([newKey, value]);
        }
      }
      return entries;
    };
  
    return log.propertiesChanged ? flattenProperties(log.propertiesChanged) : [];
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Get Time
  getTime(timestamp:string){
    const time = new Date(timestamp);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(timestamp:string): string {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const month = monthFormatter.format(date);
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
  }
}