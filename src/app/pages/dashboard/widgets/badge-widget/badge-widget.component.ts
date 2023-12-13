import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge-widget',
  templateUrl: './badge-widget.component.html',
  styleUrls: ['./badge-widget.component.scss']
})
export class BadgeWidgetComponent {
  @Input() tittle: string ='';
  @Input() quantity: number
}
