import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Color, Move, Position, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { Game } from '../../utilities/data';
import { StudyNavigator } from './classes/study-navigator';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class StudyComponent implements OnInit {
    study: Study | null = null;
    studyNav: StudyNavigator = new StudyNavigator(new Study());
    game: Game | null = null;
    isWhitePerspective: boolean = true;

    constructor(private route: ActivatedRoute, private studyService: StudyService) {
      let studyId = this.route.snapshot.paramMap.get('id');
      if(studyId){
        this.studyService.getStudy(studyId).subscribe(s => {
          this.study = s;
          this.studyNav = new StudyNavigator(this.study);
          this.isWhitePerspective = s.perspective == Color.White;
          this.game = <Game>{
            studyId: s.id,
            title: s.title,
            opening: s.title,
            fen: s.continuation?.movesToPosition[0].fen,
            fromWhitePerspective: s.perspective == Color.White
          };
        });
      }
    }

    ngOnInit(): void {
      
    }

    destroyItAll = (): void => {
      if(this.study?.continuation?.position){
        let p = new Position();
        p.tags = [];
        p.title = 'Poopoopeepee';
        p.description = 'dd';
        p.move = new Move();
        p.continuations = [];
        p.move.name = "kill";
        p.move.fen = 'rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4'
        this.study.continuation.position = p;

      }
    }

    updateBoard = (move: Move | null): void => {
      if(move && this.game && move.fen && this.study){
        this.game = <Game>{
        studyId: this.study.id,
        title: this.study.title,
        opening: this.study.title,
        fen: move.fen,
        fromWhitePerspective: this.study.perspective == Color.White
      };
      }
    }
    i = 0;
    updateStudy = (move: Move | null): void => {
      if(move) {
        if(this.studyNav.hasNext(move.name ?? '-')){
          this.studyNav.next(move.name)
        }else{
          this.studyNav.addMove(move);
        }
      }
    }
    

    
}
