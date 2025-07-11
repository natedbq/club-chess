import { Component } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, Evaluation, ExploreNode, Move, MoveData } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { LichessService } from '../../services/lichess.service';
import { DrawingService } from '../drawing/drawing.service';
import { ExternalBoardControlService } from '../chess-board/external-board-control.service';
import { BoardUtility } from '../../chess-logic/FENConverter';
import { MoveDetail } from '../study-navigation/study-navigation.component';
import { of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-engine-explore',
  templateUrl: './engine-explore.component.html',
  styleUrls: ['./engine-explore.component.css']
})
export class EngineExploreComponent {

  moveData: MoveData | null = null;
  explore: ExploreNode | null = null;
  moveNum: number = 1;
  isWhite: boolean = true;
  player: Color = Color.White;
  evaluating = false;
  private analysisRequest$ = new Subject<MoveData>();

  pv1: boolean = false;
  cp1: number = 0;
  moves1: string[] = [];
  uci1: string = '';

  pv2: boolean = false;
  cp2: number = 0;
  moves2: string[] = [];
  uci2: string = '';

  pv3: boolean = false;
  cp3: number = 0;
  moves3: string[] = [];
  uci3: string = '';

  pv4: boolean = false;
  cp4: number = 0;
  moves4: string[] = [];
  uci4: string = '';

  constructor(private router: Router, private studyNavService: StudyNavigationService, private lichessService: LichessService,
    private drawingService: DrawingService, private externalBoardControlService: ExternalBoardControlService
  ){
    this.update(<MoveData>{
      move: {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        name: 'new'
      }
    })
    this.studyNavService.study$.subscribe((study) => {
      this.isWhite = study?.perspective == Color.White;
      lichessService.explore(study?.position?.move?.fen ?? '', '').subscribe({
        next: (moves) => this.explore = moves,
        error : (e) => this.explore = null
      });
    });
    this.studyNavService.moveDetail$.subscribe((m) => {
      if(m){
        this.analysisRequest$.next(m);
      }
    });
    this.analysisRequest$.pipe(switchMap(m => this.getEvalutation(m) )).subscribe((m) => {
      this.update(m);
    });
    
    this.analysisRequest$.next(<MoveData>{
      move: {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        name: 'new'
      }
    });
  }
  
  
  select(index: number){
    let uci: string|null = null;
    if(index == 1){
      uci = this.uci1
    }
    if(index == 2){
      uci = this.uci2;
    }
    if(index == 3){
      uci = this.uci3;
    }
    if(index == 4){
      uci = this.uci4;
    }

  getMoveNum(index: number){
    return this.moveNum + Math.floor(index / 2);
  }
  getEvalutation(m: MoveData){
    this.pv1 = false;
      this.pv2 = false;
      this.pv3 = false;
      this.pv4 = false;
      this.player = m?.player ?? Color.White;
      this.moveData = m;
      this.evaluating = true;
      this.moveNum = this.studyNavService.getMoveNumber();
    if(m?.move?.fen)
      return this.lichessService.cloudEval(m.move.fen);
    return of(null);
  }
  update(evaluation: Evaluation | null){
    if(!evaluation){
      return;
    }

      if(evaluation.pvs.length > 0){
          this.pv1 = true;
          this.cp1 = evaluation.pvs[0].cp / 100;
          this.moves1 = evaluation.pvs[0].moveNames.split(" ");
          this.uci1 = evaluation.pvs[0].moves.split(" ")[0];
      }
      if(evaluation.pvs.length > 1){
          this.pv2 = true;
          this.cp2 = evaluation.pvs[1].cp / 100;
          this.moves2 = evaluation.pvs[1].moveNames.split(" ");
          this.uci2 = evaluation.pvs[1].moves.split(" ")[0];
      }
      if(evaluation.pvs.length > 2){
          this.pv3 = true;
          this.cp3 = evaluation.pvs[2].cp / 100;
          this.moves3 = evaluation.pvs[2].moveNames.split(" ");
          this.uci3 = evaluation.pvs[2].moves.split(" ")[0];
      }
      if(evaluation.pvs.length > 3){
          this.pv4 = true;
          this.cp4 = evaluation.pvs[3].cp / 100;
          this.moves4 = evaluation.pvs[3].moveNames.split(" ");
          this.uci4 = evaluation.pvs[3].moves.split(" ")[0];
      }
      this.evaluating = false;
  }
  
  
  select(index: number){
    let uci: string|null = null;
    if(index == 1){
      uci = this.uci1
    }
    if(index == 2){
      uci = this.uci2;
    }
    if(index == 3){
      uci = this.uci3;
    }
    if(index == 4){
      uci = this.uci4;
    }

    if(!uci){
      return;
    }

    let x1 = "abcdefgh".indexOf(uci[0]);
    let y1 = (Number(uci[1]) - 1);
    let x2 = "abcdefgh".indexOf(uci[2]);
    let y2 = Number(uci[3]) - 1;

    this.externalBoardControlService.click(x1,y1);
    this.externalBoardControlService.click(x2,y2);
    this.drawingService.clearPreview();
  }
  drawPreview(index: number ){
    let uci: string|null = null;
    if(index == 1){
      uci = this.uci1
    }
    if(index == 2){
      uci = this.uci2;
    }
    if(index == 3){
      uci = this.uci3;
    }
    if(index == 4){
      uci = this.uci4;
    }

    if(!uci){
      return;
    }

    let x1 = "abcdefgh".indexOf(uci[0]);
    let y1 = (Number(uci[1]) - 1);
    let x2 = "abcdefgh".indexOf(uci[2]);
    let y2 = Number(uci[3]) - 1;

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