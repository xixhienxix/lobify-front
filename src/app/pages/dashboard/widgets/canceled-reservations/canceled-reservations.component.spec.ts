import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanceledReservationsComponent } from './canceled-reservations.component';

describe('CanceledReservationsComponent', () => {
  let component: CanceledReservationsComponent;
  let fixture: ComponentFixture<CanceledReservationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanceledReservationsComponent]
    });
    fixture = TestBed.createComponent(CanceledReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
