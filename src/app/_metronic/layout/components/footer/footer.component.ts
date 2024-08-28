import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VersionService } from 'src/app/services/version.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit{
  @Input() appFooterContainerCSSClass: string = '';

  version: string = '';
  timeStamp:string=''
  constructor(private versionService: VersionService) {}

  async ngOnInit(){
    this.versionService.getCurrentVersion().subscribe(version => {
      this.version = version;
      // const firstSplit = this.version.split(',')[1]
      // const secondSplit = firstSplit.split(':')[1].trim();
      // this.timeStamp = this.formatDate(this.parseDateFromTimestamp(secondSplit));
    });  
  }

  parseDateFromTimestamp(timestamp: string): Date {
    if (!timestamp || timestamp.length !== 8) return new Date;
  
    const year = parseInt(timestamp.substring(0, 4), 10);
    const month = parseInt(timestamp.substring(4, 6), 10) - 1; // Months are 0-based
    const day = parseInt(timestamp.substring(6, 8), 10);
  
    return new Date(year, month, day);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  

}
