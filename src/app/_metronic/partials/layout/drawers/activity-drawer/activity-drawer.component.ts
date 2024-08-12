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
  currentUser:string;

  constructor(private _logService: LogService,
    private _authService: AuthService
  ) {
    this.currentUser = this._authService.getUserInfo().username
  }

  async ngOnInit(): Promise<void> {
    this.getLogs(this.currentUser);
    console.log("logsArray",this.logs)
  }
  getLogs(username:string){
    this._logService.getLogs(this.currentUser).subscribe({
      next:(data)=>{
        this.logs = this._logService.getuserLogs.value;
        console.log('behaviorsubject',this._logService.getuserLogs.value);
        console.log('data',data)
      }
    });
  }
}
