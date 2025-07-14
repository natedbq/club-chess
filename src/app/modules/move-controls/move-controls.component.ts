import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, ExploreNode, Move, MoveData, Position } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { LichessService } from '../../services/lichess.service';
import { DrawingService } from '../drawing/drawing.service';
import { ExternalBoardControlService } from '../chess-board/external-board-control.service';
import { BoardUtility } from '../../chess-logic/FENConverter';
import { PositionService } from '../../services/position.service';

@Component({
  selector: 'app-move-controls',
  templateUrl: './move-controls.component.html',
  styleUrls: ['./move-controls.component.css']
})
export class MoveControlsComponent {

  move: Move | null = null;
  position: Position | null = null;
  positionIsActive: boolean | null = null;
  loaded = false;

  constructor(private positionService: PositionService, private navService: StudyNavigationService){

    this.navService.study$.subscribe((s) => {
      if(s == null){
        this.loaded = false;
      }else{
        this.loaded = true;
      }
    })
    this.navService.moveDetail$.subscribe((s) => {
      if(s){
        this.move = s.move;
        this.position = s.position ?? null;
        if(this.position){
          this.positionIsActive = this.position.isActive;
        }
      }
    });

  }

  ignore = (): void => {
    if(this.position){
      if(this.position.move?.name == "-"){
        alert("Error: cannot deactivate the root position.");
        return;
      }
      this.position.isActive = !this.position.isActive;
      this.position.isDirty = true;
    }
  }

  isPreview = (): boolean => {
    return this.loaded && this.navService.getStudy()?.summaryFEN == this.move?.fen;
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