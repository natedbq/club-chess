import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyDescriptionComponent } from './study-description.component';

describe('StudyDescriptionComponent', () => {
  let component: StudyDescriptionComponent;
  let fixture: ComponentFixture<StudyDescriptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudyDescriptionComponent]
    });
    fixture = TestBed.createComponent(StudyDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
