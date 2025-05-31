import { Component } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { SettingsService } from '../settings/settings.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { Move, Position } from '../../chess-logic/models';

@Component({
  selector: 'app-save-study',
  templateUrl: './save-study.component.html',
  styleUrls: ['./save-study.component.css']
})
export class SaveStudyComponent {
  move: Move | null = null;
  position: Position | null = null;

  constructor(private navService: StudyNavigationService){

    this.navService.moveDetail$.subscribe((s) => {
      if(s){
        this.move = s.move;
        this.position = s.position ?? null;
      }
    });

  }

  public save() {
    if(this.canSave()){
      this.navService.saveStudy();
    }
  }

  canSave = () => {
    return this.navService.isDirty();
  }
}
