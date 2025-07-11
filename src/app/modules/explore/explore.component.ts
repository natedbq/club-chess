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

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {

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
    })
    this.studyNavService.moveDetail$.subscribe((m) => {
      this.moveData = m;
      if(m){
        let play = '';
        let pointer = studyNavService.getPointer();
        if(pointer?.pointer){
          while(pointer && pointer.pointer?.move?.name != '-'){
            if(play.length > 0){
              play = ','+play;
            }
            play = (pointer.pointer?.move?.from ?? '') + (pointer.pointer?.move?.to ?? '') + play;
            pointer = pointer.parent;
          }
          lichessService.explore(m?.move?.fen ?? '', play).subscribe({
            
            next: (moves) => this.explore = moves,
            error : (e) => this.explore = null
          });
        }else{
          this.explore = null;
        }
      }
    });
  }

  select(node: ExploreNode){
    let uci = node.uci;
    if(node.san.toLowerCase().indexOf("o-o-o") >= 0){
      uci = uci.replace("a","c");
    }else if(node.san.toLowerCase().indexOf("o-o") >= 0){
      uci = uci.replace("h", "g");
    }
    let x1 = "abcdefgh".indexOf(uci[0]);
    let y1 = (Number(uci[1]) - 1);
    let x2 = "abcdefgh".indexOf(uci[2]);
    let y2 = Number(uci[3]) - 1;


    this.externalBoardControlService.click(x1,y1);
    this.externalBoardControlService.click(x2,y2);
    this.drawingService.clearPreview();
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
  
  calc(node: ExploreNode | null): NodePercents {
    if(node == null){
      return {
        plays: 0,
        white: 0,
        draws: 0,
        black: 0
      }
    }
    let total = node.white + node.black + node.draws + 0.0;
    let grandTotal = total;
    if(this.explore){
      grandTotal = this.explore.white + this.explore.draws + this.explore.black;
    }
    let per = {
      plays: ((node.white + node.draws + node.black) / (grandTotal)) * 100,
      white: (node.white / total) * 100,
      draws: (node.draws / total) * 100,
      black: (node.black / total) * 100
    };

    return per;
  }
}

interface NodePercents{
  plays: number;
  white: number;
  draws: number;
  black: number;
}