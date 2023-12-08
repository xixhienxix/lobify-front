import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InHouseComponent } from './in-house.component';

describe('InHouseComponent', () => {
  let component: InHouseComponent;
  let fixture: ComponentFixture<InHouseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InHouseComponent]
    });
    fixture = TestBed.createComponent(InHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
