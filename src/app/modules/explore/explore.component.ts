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

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {

  moveData: MoveData | null = null;
  explore: ExploreNode | null = null;
  isWhite: boolean = true;

  constructor(private router: Router, private studyNavService: StudyNavigationService, private lichessService: LichessService){
    this.studyNavService.study$.subscribe((study) => {
      this.isWhite = study?.perspective == Color.White;
      lichessService.explore(study?.position?.move?.fen ?? '', '').subscribe((moves) => {
        this.explore = moves;
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
          lichessService.explore(m?.move?.fen ?? '', play).subscribe((moves) => {
            this.explore = moves;
          });
        }else{
          this.explore = null;
        }
      }
    });
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