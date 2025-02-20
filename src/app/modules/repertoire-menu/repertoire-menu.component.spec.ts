import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepertoireMenuComponent } from './repertoire-menu.component';

describe('RepertoireMenuComponent', () => {
  let component: RepertoireMenuComponent;
  let fixture: ComponentFixture<RepertoireMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepertoireMenuComponent]
    });
    fixture = TestBed.createComponent(RepertoireMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
