import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeparturesComponent } from './departures.component';

describe('DeparturesComponent', () => {
  let component: DeparturesComponent;
  let fixture: ComponentFixture<DeparturesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeparturesComponent]
    });
    fixture = TestBed.createComponent(DeparturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
