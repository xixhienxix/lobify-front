import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureReservationsComponent } from './future-reservations.component';

describe('FutureReservationsComponent', () => {
  let component: FutureReservationsComponent;
  let fixture: ComponentFixture<FutureReservationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FutureReservationsComponent]
    });
    fixture = TestBed.createComponent(FutureReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
