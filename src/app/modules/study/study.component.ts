import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Color, Move, MoveData, Position, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { StudyNavigator } from './classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { MoveDelegation, MoveDelegator } from '../../chess-logic/moveDelegator';
import { MoveDetail } from '../study-navigation/study-navigation.component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';

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
    doStudy = false;

    constructor(private route: ActivatedRoute, 
      private studyService: StudyService, 
      private positionService: PositionService, 
      private floatingImageService: FloatingImageService,
      private router: Router) {
        this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            MoveDelegator.stop();
            MoveDelegator.clear();
          }
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
                  player: s.perspective ,
                  extra: {}
                };
              }
              this.loading = false;
              if(!this.isWhitePerspective){
                
                setTimeout(() => {
                  this.oneMove();

                  // let moves = 5;
                  // let someFunc = () => {
                  //   this.controller.next(this.studyNav.getVariations()[0].name, true);
                  //   if(moves-- > 0){

                  //     let moveDel = new MoveDelegation(() => {
                  //       someFunc();
                  //     });
                  //     MoveDelegator.addDelegations(moveDel);
                  //   }
                  // }
                  // let moveDel = new MoveDelegation(() => {
                  //   someFunc();
                    
                  // });
                  //MoveDelegator.addDelegations(moveDel);

                  
                }, 1000);
              }
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

    activateStudy = (): void => {
      console.log('start')
      this.doStudy = true;
      this.oneMove();
      MoveDelegator.start();
    }

    pauseStudy = (): void => {
      console.log('stop!')
      this.doStudy = false;
      MoveDelegator.stop();
      MoveDelegator.clear();
    }

    oneMove = (): void => {
      
      if(!this.doStudy){
        return;
      }

      let pick = Math.floor(Math.random() * this.studyNav.getVariations().length)
      let  moveDelegation = new MoveDelegation(() => {
        if(this.doStudy){
          while(this.controller == null){}
          this.controller.next(this.studyNav.getVariations()[pick].name, true);
        }
      }, 1, 'init');

      MoveDelegator.addDelegations(moveDelegation);
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
      if(data.move && this.moveData && data.move.fen && this.study){
        this.moveData = data
        if(this.controller && this.studyNav.getVariations().length == 0){
          this.completeLine(data);
        }
      }
    }

    getXY(data: any){
      let x = 400;
      let y = 400;
      if(data.y){
        y = data.y+data.squareSize/2;
        x = data.x-(data.squareSize / 2);
      }
      return {x:x,y:y}
    }
    completeLine(data: MoveData){
      if(!this.doStudy){
        return;
      }
      const {x,y} = this.getXY(data.extra);
      this.floatingImageService.showImage('crown-gold.png',  y, x);
      setTimeout(() => {
        this.floatingImageService.hideImage();
        if(this.doStudy){
          this.controller.first();
          this.oneMove();
        }
      }, 2000);
    }

    wrongLine(data: MoveData){
      if(!this.doStudy){
        return;
      }

      
      let pointer = this.studyNav.getPointer();
      let position = pointer.pointer;
      if(position && this.studyNav.isVariation()){
        position.weight++;
      }

      const {x,y} = this.getXY(data.extra);
      this.floatingImageService.showImage('wrong.png', y, x);
      setTimeout(() => {
        this.floatingImageService.hideImage();
        this.controller.refresh();
      }, 2000);
    }
    
    markCorrect = (): void => {
      let pointer = this.studyNav.getPointer();
      let position = pointer.pointer;
      if(position && this.studyNav.isVariation()){
        //position.weight--;
      }
    }

    updateStudy = (data: MoveData | null): void => {
      if(data?.move) {
        if(this.studyNav.hasNext(data.move.name ?? '-')){
          this.markCorrect();
          this.studyNav.next(data.move.name);
        }else{
          
          this.wrongLine(data);
          if(!this.doStudy){
            this.studyNav.addMove(data.move);
            this.studyNav.next(data.move.name);
          }
          return;
        }


        if(data.player == (this.isWhitePerspective ? Color.White : Color.Black)){
          let variations = this.studyNav.getVariations();
          if(variations.length > 0){
            let delegations: MoveDelegation[] = [];
            variations.forEach(m => {
              let moveDelegation: MoveDelegation = new MoveDelegation(() => {
                if(this.doStudy)
                this.controller.next(m.name, true);
                console.log(m.name, this.studyNav.getTotalExcessWeightInTree(m.name));
    
              }, this.studyNav.getTotalExcessWeightInTree(m.name), 'navigator');
              delegations.push(moveDelegation);
            });
            MoveDelegator.addDelegations(delegations);
          }else{
            this.completeLine(data);
          }
        }
      }
    }
}

export class StudyController {
  public next: ( name: string | null, alwaysUpdate: boolean) => void = () => {};
  public previous: () => void = () => {}
  public getVariations: () => MoveDetail[] = () => [];
  public first: () => void = () => {}
  public refresh: () => void = () => {}
}
