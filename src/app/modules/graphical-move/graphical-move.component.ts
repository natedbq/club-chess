import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, ExploreNode, Move, MoveData } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { LichessService } from '../../services/lichess.service';
import { DrawingService } from '../drawing/drawing.service';
import { ExternalBoardControlService } from '../chess-board/external-board-control.service';
import { BoardUtility } from '../../chess-logic/FENConverter';

@Component({
  selector: 'app-graphical-move',
  templateUrl: './graphical-move.component.html',
  styleUrls: ['./graphical-move.component.css']
})
export class GraphicalMoveComponent implements OnChanges {

  @Input() moveName: string = '';

  piece: string = 'N';
  @Input() player: Color = Color.White;
  white: Color = Color.White;
  move: string = '';

  constructor(  ){
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if("KRBNQ".includes(this.moveName[0])){
      this.piece = this.moveName[0];
      this.move = this.moveName.substring(1);
    }else{
      this.piece = 'pawn';
      this.move = this.moveName;
    }
  }
  
}