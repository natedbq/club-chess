import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Color, Move, MoveData, Position, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { StudyNavigator } from './classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { MoveDelegation, MoveDelegator } from '../../chess-logic/moveDelegator';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class StudyComponent implements OnInit {
    study: Study | null = null;
    studyNav: StudyNavigator = new StudyNavigator(new Study());
    moveData: MoveData | null = null;
    isWhitePerspective: boolean = true;
    loading = false;
    controller = new StudyController();

    constructor(private route: ActivatedRoute, private studyService: StudyService, private positionService: PositionService) {
      MoveDelegator.addDisqualifier((data: MoveData): boolean => {
        return data.source != 'board';
      });
      MoveDelegator.addDisqualifier((data: MoveData): boolean => {
        return data.player != this.study?.perspective
      });
      
      let studyId = this.route.snapshot.paramMap.get('id');
      this.loading = true;
      if(studyId){
        this.studyService.getStudy(studyId).subscribe(s => {
          this.study = s;

          if(this.study.positionId){
            this.positionService.getByParentId(this.study.positionId, 5).subscribe(children => {
              if(this.study?.position?.positions){
                this.study.position.positions = children;

                this.studyNav = new StudyNavigator(this.study);
                this.isWhitePerspective = s.perspective == Color.White;
                this.moveData = <MoveData>{
                  move: this.studyNav.peek(),
                  source: 'study-component',
                  player: s.perspective 
                };
              }
              this.loading = false;
            });
          }

        });
      }
    }

    ngOnInit(): void {
      
    }

    getPerspective = (): Color => {
      if(this.study?.perspective){
        return this.study.perspective;
      }
      return Color.White;
    }

    save = (): void => {
      this.study = this.studyNav.getStudy();
      let position = this.study.position;
      if(this.study){
        this.studyService.saveStudy(this.study).subscribe({
          
          complete: () => console.log('Study saved'),
          error : (e) => console.error('Error saving study:', e)
        }
        );
      }

      if(position){
        this.positionService.save(position).subscribe({
          
          complete: () => console.log('Positions saved'),
          error : (e) => console.error('Error saving position:', e)
        }
        );
      }
    }

    updateBoard = (data: MoveData): void => {
      console.log('ddfdfdf')
      if(data.move && this.moveData && data.move.fen && this.study){
        this.moveData = data
      }
    }
    
    updateStudy = (move: Move | null): void => {
      if(move) {
        if(this.studyNav.hasNext(move.name ?? '-')){
          this.studyNav.next(move.name)
        }else{
          this.studyNav.addMove(move);
          this.studyNav.next(move.name);
        }

        MoveDelegator.clearDelegations('navigator');
        this.studyNav.getVariations().forEach(m => {
          let moveDelegation: MoveDelegation = new MoveDelegation(() => true, (data: MoveData) => {
            this.controller.next(data.move?.name ?? null);
            console.log(m.name)
          }, 1, 'navigator');
          MoveDelegator.addDelegation(moveDelegation);
          
        })
      }
    }
}

export class StudyController {
  public next: ( name: string | null) => void = () => {};
}
