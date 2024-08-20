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
  logsType1: ActivityLogs[] = []; // Reservas
  logsType2: ActivityLogs[] = []; // Estatus
  estatusLogs: ActivityLogs[] = [];
  currentUser: string;

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
        this.logs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.splitLogsByType();
      },
      error: (error) => {
        console.error('Failed to fetch logs:', error);
      }
    });
  }

  subscribeToUserLogs() {
    this._logService.userLogs$.subscribe({
      next: (logs) => {
        this.logs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.splitLogsByType();
      },
      error: (error) => {
        console.error('Failed to fetch logs from BehaviorSubject:', error);
      }
    });
  }

  splitLogsByType() {
    this.logsType1 = this.logs.filter(log => log.logType === 1);
    this.logsType2 = this.logs.filter(log => log.logType === 2);
  }

  // Get Time
  getTime(timestamp:string){
    const time = new Date(timestamp);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`
  }

  formatDate(timestamp:string): string {
    const date = new Date(timestamp);

    const day = date.getDate().toString().padStart(2, '0');
    
    const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const month = monthFormatter.format(date);
  
    const year = date.getFullYear();
  
    return `${day} de ${month} del ${year}`;
  }

  formatTimeStamp(log:ActivityLogs){
    const time = log.timestamp.split(' ')[2]
    const month = log.timestamp.split(' ')[1]
    const day = log.timestamp.split(' ')[0]

    return 
  }
}
