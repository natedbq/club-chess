import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Color, MoveData, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { StudyNavigator } from './classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { MoveDelegation, MoveDelegator } from '../../chess-logic/moveDelegator';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { LichessService } from '../../services/lichess.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { ActivateStudyService } from './activate-study.service';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class StudyComponent implements OnInit {
    study: Study | null = null;
    studyId: string;
    //studyNav: StudyNavigator = new StudyNavigator(new Study());
    moveData: MoveData | null = null;
    isWhitePerspective: boolean = true;
    loading = false;
    doStudy = false;
    pauseTime = 2500;
    mistakeCounter = 0;
    isRetry = false;

    constructor(private route: ActivatedRoute, 
      private studyService: StudyService, 
      private positionService: PositionService, 
      private floatingImageService: FloatingImageService,
      private router: Router,
      private lichessService: LichessService,
      private studyNavigationService: StudyNavigationService,
      private activateStudyService: ActivateStudyService
    ) {
        this.activateStudyService.play$.subscribe((p) => {
          if(p){
            this.activateStudy();
          }else{
            this.pauseStudy();
          }
        });

        this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            MoveDelegator.stop();
            MoveDelegator.clear();
          }
        });

      this.studyNavigationService.proposedMove$.subscribe(m => {
        if(m?.source == 'board'){
          this.updateStudy(m);
        }
      });
      
      this.studyId = this.route.snapshot.paramMap.get('id') ?? '';

      if(this.studyId != ''){
        this.studyNavigationService.load(this.studyId);
      }

      this.loading = true;
      if(this.studyId){
        this.studyService.getStudy(this.studyId).subscribe(s => {
          this.study = s;

          if(this.study.positionId){
            this.positionService.getByParentId(this.study.positionId, 5).subscribe(children => {
              if(this.study?.position?.positions){
                this.study.position.positions = children;

                let studyNav = new StudyNavigator(this.study);
                this.isWhitePerspective = s.perspective == Color.White;
                this.moveData = <MoveData>{
                  move: studyNav.peek(),
                  source: 'study-component',
                  player: s.perspective ,
                  extra: {}
                };
              }
              this.loading = false;
              if(!this.isWhitePerspective){
                
                setTimeout(() => {
                  this.oneMove();                  
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
      
      if(this.doStudy){
        this.wrongLine();
        setTimeout(() => {
          this.oneMove();
          this.oneMove();
        }, this.pauseTime);
      }else{
        this.doStudy = true;
        this.studyNavigationService.first();
        MoveDelegator.start();
        if(this.isWhitePerspective){
          this.oneMove();
          this.oneMove();
        }else{
          this.oneMove();
        }
      }
    }

    pauseStudy = (): void => {
      this.doStudy = false;
      MoveDelegator.stop();
      MoveDelegator.clear();
      this.studyNavigationService.clearWeights();
    }

    oneMove = (): void => {
      
      if(!this.doStudy){
        return;
      }

      let  moveDelegation = new MoveDelegation(() => {
        if(this.doStudy){
          this.studyNavigationService.next();
        }
      }, 1, 'init');

      MoveDelegator.addDelegations(moveDelegation);
    }


    updateBoard = (data: MoveData): void => {
      if(data.move && this.moveData && data.move.fen && this.study){
        this.moveData = data
        // if(this.controller && this.studyNavigationService.getVariations().length == 0){
        //   this.completeLine(data);
        // }
      }
    }

    getXY(data: any){
      let x = 400;
      let y = 400;
      if(data?.y){
        y = data.y+data.squareSize/2;
        x = data.x-(data.squareSize / 2);
      }
      return {x:x,y:y}
    }
    focus = (): void => {
      this.studyNavigationService.addWeightToTree(3);
    }

    completeLine(data: MoveData){
      if(!this.doStudy){
        return;
      }
      const {x,y} = this.getXY(data.extra);

      
      let pointer = this.studyNavigationService.getPointer()?.pointer;
      if(pointer){

        console.log('eval',pointer.move?.name)
        this.lichessService.evaluate(pointer.move?.fen ?? '-').subscribe({ 
          next: (evaluation) => {
            this.floatingImageService.showImage('crown-gold.png',  y, x, evaluation / 100);
            setTimeout(() => {
              this.floatingImageService.hideImage();
              if(this.doStudy){
                this.studyNavigationService.first();
                if(this.isWhitePerspective){
                  this.oneMove();
                  this.oneMove();
                }else{
                  this.oneMove();
                }
              }
            }, this.pauseTime);
          },
          error: (e) => {
            this.floatingImageService.showImage('crown-gold.png',  y, x);
            setTimeout(() => {
              this.floatingImageService.hideImage();
              if(this.doStudy){
                this.studyNavigationService.first();
                if(this.isWhitePerspective){
                  this.oneMove();
                  this.oneMove();
                }else{
                  this.oneMove();
                }
              }
            }, this.pauseTime);
          }
        })
      }
      
    }


    wrongLine(data: MoveData|null = null){
      if(!this.doStudy){
        return;
      }

      this.isRetry = true;
      let pointer = this.studyNavigationService.getPointer();
      if(pointer){
        let position = pointer.pointer;
        if(position && this.mistakeCounter < 3){
          position.weight++;
          this.mistakeCounter++;
        }
      }

      const {x,y} = this.getXY(data?.extra);
      this.floatingImageService.showImage('wrong.png', y, x);
      setTimeout(() => {
        this.floatingImageService.hideImage();
        this.studyNavigationService.refresh();
      }, this.pauseTime);
    }
    
    markCorrect = (): void => {
      let pointer = this.studyNavigationService.getPointer();
      if(pointer?.pointer){
        let position = pointer.pointer;
        this.mistakeCounter = 0;
        if(!this.isRetry){
          position.weight = Math.max(0, position.weight - 1)
        }
        this.isRetry = false;
      }
    }

    updateStudy = (data: MoveData | null): void => {
      if(data?.move){
        if(this.studyNavigationService.hasNext(data.move.name ?? '-')){
          this.correctMove(data);
        }else{
          this.wrongMove(data);
        }
      }
    }

    correctMove = (data: MoveData) => {
      if(this.doStudy){
        this.markCorrect();
        this.studyNavigationService.next(data.move?.name);
        if(this.studyNavigationService.getVariations().length == 0){
          this.completeLine(data);
        }else{
          if(data.player == (this.isWhitePerspective ? Color.White : Color.Black)){
            let delegations: MoveDelegation[] = [];
            let variations = this.studyNavigationService.getVariations();
            variations.forEach(m => {
              let branchWeight = Math.max(1,this.studyNavigationService.getTotalExcessWeightInTree(m.name));
              let moveDelegation: MoveDelegation = new MoveDelegation(() => {
                if(this.doStudy){
                  this.studyNavigationService.next(m.name);
                }
    
              }, branchWeight, 'navigator');
              delegations.push(moveDelegation);
            });
            MoveDelegator.addDelegations(delegations);
          }
        }
      }else{
        if(data.move){
          this.studyNavigationService.addMove(data.move)
          this.studyNavigationService.next(data.move?.name);
        }
      }
    }

    wrongMove = (data: MoveData) => {
      if(this.doStudy){
        this.wrongLine(data);
      }else{
        if(data.move){
          this.studyNavigationService.addMove(data.move)
          this.studyNavigationService.next(data.move?.name);
        }
      }
    }

    updateStudyOld = (data: MoveData | null): void => {
      // if(data?.move) {
      //   if(this.studyNav.hasNext(data.move.name ?? '-')){
      //     this.markCorrect();
      //     this.studyNav.next(data.move.name);
      //   }else{
          
      //     this.wrongLine(data);
      //     if(!this.doStudy){
      //       this.studyNav.addMove(data.move);
      //       this.studyNav.next(data.move.name);
      //     }
      //     return;
      //   }


      //   if(data.player == (this.isWhitePerspective ? Color.White : Color.Black)){
      //     let variations = this.studyNav.getVariations();
      //     if(variations.length > 0){
      //       let delegations: MoveDelegation[] = [];
      //       variations.forEach(m => {
      //         let branchWeight = Math.max(1,this.studyNav.getTotalExcessWeightInTree(m.name));
      //         let moveDelegation: MoveDelegation = new MoveDelegation(() => {
      //           if(this.doStudy)
      //           this.controller.next(m.name, true);
    
      //         }, branchWeight, 'navigator');
      //         delegations.push(moveDelegation);
      //       });
      //       MoveDelegator.addDelegations(delegations);
      //     }else{
      //       this.completeLine(data);
      //     }
      //   }
      // }
    }
}
