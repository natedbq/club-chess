import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Color, ExploreNode, MoveData, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { StudyNavigator } from './classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { MoveDelegation, MoveDelegator } from '../../chess-logic/moveDelegator';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { LichessService } from '../../services/lichess.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { ActivateStudyService } from './activate-study.service';
import { GlobalValues, SettingsService } from '../settings/settings.service';
import { ExternalBoardControlService } from '../chess-board/external-board-control.service';
import { Subject, takeUntil } from 'rxjs';

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
    id = Date.now();
    destroy$ = new Subject<void>();

    constructor(private route: ActivatedRoute, 
      private studyService: StudyService, 
      private positionService: PositionService, 
      private floatingImageService: FloatingImageService,
      private router: Router,
      private lichessService: LichessService,
      private studyNavigationService: StudyNavigationService,
      private externalBoardControlService: ExternalBoardControlService,
      private activateStudyService: ActivateStudyService,
      private settingsService: SettingsService
    ) {
      this.settingsService.pauseTime$.pipe(takeUntil(this.destroy$)).subscribe((t) => {
        this.pauseTime = t * 1000;
      })
        this.activateStudyService.play$.pipe(takeUntil(this.destroy$)).subscribe((p) => {
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
            this.destroy$.next();
            this.destroy$.complete();
          }
        });

      this.studyNavigationService.proposedMove$.pipe(takeUntil(this.destroy$)).subscribe(m => {
        if(m?.source == 'board'){
          this.updateStudy(m);
        }
      });
      
      this.studyId = this.route.snapshot.paramMap.get('id') ?? '';

      if(this.studyId != ''){
        this.studyNavigationService.load(this.studyId);
      }

      this.studyNavigationService.moveDetail$.subscribe((m) => {
        if(this.floatingImageService.isVisible()){
          this.floatingImageService.hideImage();
        }
      })

      this.loading = true;
      if(this.studyId){
        this.studyNavigationService.study$.subscribe((s) => {
          if(!s || !s.position){
            return;
          }
          let pointer = this.studyNavigationService.getPointer();
          if(pointer){
            //this.studyNavigationService.setWeight(pointer).then(() => {
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
                  console.log("done loading");
                  if(!this.isWhitePerspective){
                    
                    setTimeout(() => {
                      this.oneMove();                  
                    }, 1000);
                  }
                });
              }
            //});
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
      this.createMoveDecisions();
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

    
    @HostListener('window:mousedown', ['$event'])
    onGlobalMouseDown(event: MouseEvent) {
      if(!this.settingsService.autoNextLine() && this.floatingImageService.isVisible() && !this.activateStudyService.isBoardLocked()){
        const rect = document.getElementById('board')?.getBoundingClientRect();
        if(rect 
          && rect.left < event.clientX && rect.right > event.clientX
          && rect.bottom > event.clientY && rect.top < event.clientY
        ){
          this.continueToNextLine();
        }
      }
    }
    
    continueToNextLine(){
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
            if(this.settingsService.autoNextLine()){
              setTimeout(() => {
                this.continueToNextLine();
              }, this.pauseTime);
            }
          },
          error: (e) => {
            this.floatingImageService.showImage('crown-gold.png',  y, x);
            if(this.settingsService.autoNextLine()){
              setTimeout(() => {
                this.continueToNextLine();
              }, this.pauseTime);
            }
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
        if(position?.mistakes != null && position?.id && this.mistakeCounter < 3){
          console.log("wrong");
          this.positionService.mistake(position.id).subscribe();
          position.mistakes++;
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
      if(pointer?.parent?.pointer){
        let position = pointer.parent.pointer;
        this.mistakeCounter = 0;
        if(!this.isRetry && position.id){
          position.mistakes = Math.max(0, (position.mistakes ?? 0) - 1);
          this.positionService.correct(position.id).subscribe();
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

    createMoveDecisions = () => {
      let delegations: MoveDelegation[] = [];
      let variations = this.studyNavigationService.getVariations()
        .sort((a,b) => new Date(b.position?.lastStudied ?? '').getTime() - new Date(a.position?.lastStudied ?? '').getTime());

      const build = (explore: ExploreNode | null) => {

        variations.forEach((m, i) => {
          let node = explore ? explore.moves.filter(x => x.san == m.name)[0] : null;
          let percentPicked = node ? node.percent : 0;
          let commonWeight = Math.round(percentPicked * GlobalValues.weights.commonScalar);

          let oldest = this.studyNavigationService.getOldestInTree(m.name);
          let minutesElapsed = (new Date().getTime() - oldest.getTime()) / (1000 * 60);
          let timeWeight = Math.round((Math.min(1, minutesElapsed / (GlobalValues.weights.maxNeglectInDays * 24 * 60))*1.2)
             * (GlobalValues.weights.neglectScalar));

          let mistakesWeight =  Math.min(this.studyNavigationService.getTotalMistakesInTree(m.name)/GlobalValues.weights.maxMistakes,1)
            * GlobalValues.weights.mistakesScalr;
          let branchWeight = mistakesWeight 
            + timeWeight
            + commonWeight;
          //console.log({name:m.name, mistakes:mistakesWeight, common:commonWeight, time:timeWeight, total:branchWeight})
          
          let moveDelegation: MoveDelegation = new MoveDelegation(() => {
            if(this.doStudy){
              if(m.position?.move){
                this.externalBoardControlService.playMove(m.position?.move)
              }else{
                this.studyNavigationService.nextWithSource(m.name, 'study-'+this.id, 'play');
              }
            }

            if(m.position?.id){
              m.position.lastStudied = new Date(new Date().toISOString());
              this.positionService.study(m.position.id).subscribe();
            }

          }, Math.max(1, branchWeight), 'delegator');
          delegations.push(moveDelegation);
        });
        MoveDelegator.addDelegations(delegations);
      }


      let play = '';
      let pointer = this.studyNavigationService.getPointer();
      if(pointer?.pointer){
        while(pointer && pointer.pointer?.move?.name != '-'){
          if(play.length > 0){
            play = ','+play;
          }
          play = (pointer.pointer?.move?.from ?? '') + (pointer.pointer?.move?.to ?? '') + play;
          pointer = pointer.parent;
        }
        this.lichessService.explore(pointer?.pointer?.move?.fen ?? '', play).subscribe({
          
          next: (moves) => {
            build(moves);
          },
          error : (e) => {
            build(null);
          }
        });
      }
        
        
    }

    correctMove = (data: MoveData) => {
      if(this.doStudy){
        this.markCorrect();
        if(data.position?.id){
          this.positionService.study(data.position.id).subscribe();
          data.position.lastStudied = new Date(new Date().toISOString());
        }
        this.studyNavigationService.next(data.move?.name);
        if(this.studyNavigationService.getVariations().length == 0){
          this.completeLine(data);
        }else{
          if(data.player == (this.isWhitePerspective ? Color.White : Color.Black)){
            this.createMoveDecisions();
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
}
