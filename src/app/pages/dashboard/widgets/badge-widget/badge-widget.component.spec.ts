import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeWidgetComponent } from './badge-widget.component';

describe('BadgeWidgetComponent', () => {
  let component: BadgeWidgetComponent;
  let fixture: ComponentFixture<BadgeWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BadgeWidgetComponent]
    });
    fixture = TestBed.createComponent(BadgeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
