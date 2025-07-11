import { Component } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { SettingsService } from '../settings/settings.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { Move, Position } from '../../chess-logic/models';

@Component({
  selector: 'app-move-editor',
  templateUrl: './move-editor.component.html',
  styleUrls: ['./move-editor.component.css']
})
export class MoveEditorComponent {
  move: Move | null = null;
  position: Position | null = null;

  constructor(private positionService: PositionService, private navService: StudyNavigationService){

    this.navService.moveDetail$.subscribe((s) => {
      if(s){
        this.move = s.move;
        this.position = s.position ?? null;
      }
    });

  }

  setFEN = (): void => {
    this.navService.setSummaryFEN();
  }

  delete = (): void => {
    if(this.canDelete()){
      this.navService.deleteCurrentPosition();
    }
  }
  
  canDelete = () => {
    return (this.move?.name ?? '-') !== '-';
  }
}
