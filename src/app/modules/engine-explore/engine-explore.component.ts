import { Component } from '@angular/core';
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
  selector: 'app-engine-explore',
  templateUrl: './engine-explore.component.html',
  styleUrls: ['./engine-explore.component.css']
})
export class EngineExploreComponent {

  moveData: MoveData | null = null;
  explore: ExploreNode | null = null;
  isWhite: boolean = true;

  constructor(private router: Router, private studyNavService: StudyNavigationService, private lichessService: LichessService,
    private drawingService: DrawingService, private externalBoardControlService: ExternalBoardControlService
  ){
    this.studyNavService.study$.subscribe((study) => {
      this.isWhite = study?.perspective == Color.White;
      lichessService.explore(study?.position?.move?.fen ?? '', '').subscribe({
        next: (moves) => this.explore = moves,
        error : (e) => this.explore = null
      });
    });
    this.studyNavService.moveDetail$.subscribe((m) => {
      this.moveData = m;
      if(m?.move?.fen && (m.move.name ?? '-') != '-'){
        lichessService.cloudEval(m.move.fen).subscribe((evaluation) => {
          console.log(JSON.stringify(evaluation));
        })
      }
    });
  }

  select(node: ExploreNode){
    let x1 = "abcdefgh".indexOf(node.uci[0]);
    let y1 = (Number(node.uci[1]) - 1);
    let x2 = "abcdefgh".indexOf(node.uci[2]);
    let y2 = Number(node.uci[3]) - 1;

    this.drawingService.clearPreview();

    this.externalBoardControlService.click(x1,y1);
    this.externalBoardControlService.click(x2,y2);
  }
  drawPreview(node: ExploreNode){
    let x1 = "abcdefgh".indexOf(node.uci[0]);
    let y1 = (Number(node.uci[1]) - 1);
    let x2 = "abcdefgh".indexOf(node.uci[2]);
    let y2 = Number(node.uci[3]) - 1;

    if(this.isWhite){
      y1 = 7 - y1;
      y2 = 7 - y2;
    }else{
      x1 = 7 - x1;
      x2 = 7 - x2;
    }

    this.drawingService.addMovePreview(x1,y1,x2,y2);
  }
  
}