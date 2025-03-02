import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyNavigationComponent } from './study-navigation.component';

describe('StudyNavigationComponent', () => {
  let component: StudyNavigationComponent;
  let fixture: ComponentFixture<StudyNavigationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudyNavigationComponent]
    });
    fixture = TestBed.createComponent(StudyNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
