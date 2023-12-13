import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporalReservationsWidgetComponent } from './temporal-reservations-widget.component';

describe('TemporalReservationsWidgetComponent', () => {
  let component: TemporalReservationsWidgetComponent;
  let fixture: ComponentFixture<TemporalReservationsWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TemporalReservationsWidgetComponent]
    });
    fixture = TestBed.createComponent(TemporalReservationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
