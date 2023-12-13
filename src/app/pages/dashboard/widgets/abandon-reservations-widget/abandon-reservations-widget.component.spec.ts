import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbandonReservationsWidgetComponent } from './abandon-reservations-widget.component';

describe('AbandonReservationsWidgetComponent', () => {
  let component: AbandonReservationsWidgetComponent;
  let fixture: ComponentFixture<AbandonReservationsWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbandonReservationsWidgetComponent]
    });
    fixture = TestBed.createComponent(AbandonReservationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
