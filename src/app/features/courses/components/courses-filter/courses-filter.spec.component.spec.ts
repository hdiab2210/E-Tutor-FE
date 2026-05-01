import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesFilterComponent } from './courses-filter.component';

describe('CoursesFilterComponent', () => {
  let component: CoursesFilterComponent;
  let fixture: ComponentFixture<CoursesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesFilterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
