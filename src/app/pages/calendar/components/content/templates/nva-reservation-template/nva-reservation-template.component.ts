import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nva-reservation-template',
  templateUrl: './nva-reservation-template.component.html',
  styleUrls: ['./nva-reservation-template.component.scss']
})
export class NvaReservationTemplateComponent {
  @Input() data:any;
}
