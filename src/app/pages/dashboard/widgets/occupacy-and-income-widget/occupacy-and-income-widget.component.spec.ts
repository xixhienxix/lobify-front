import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccupacyAndIncomeWidgetComponent } from './occupacy-and-income-widget.component';

describe('OccupacyAndIncomeWidgetComponent', () => {
  let component: OccupacyAndIncomeWidgetComponent;
  let fixture: ComponentFixture<OccupacyAndIncomeWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OccupacyAndIncomeWidgetComponent]
    });
    fixture = TestBed.createComponent(OccupacyAndIncomeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
