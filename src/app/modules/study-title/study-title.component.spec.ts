import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyTitleComponent } from './study-title.component';

describe('StudyTitleComponent', () => {
  let component: StudyTitleComponent;
  let fixture: ComponentFixture<StudyTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudyTitleComponent]
    });
    fixture = TestBed.createComponent(StudyTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
