import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolMenuComponent } from './tool-menu.component';

describe('ToolMenuComponent', () => {
  let component: ToolMenuComponent;
  let fixture: ComponentFixture<ToolMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToolMenuComponent]
    });
    fixture = TestBed.createComponent(ToolMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
