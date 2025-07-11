import { Component } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { SettingsService } from '../settings/settings.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { Move, Position } from '../../chess-logic/models';
import { ActivateStudyService } from '../study/activate-study.service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent {
  score: number = 0;
  startScore: number = 0;
  diff = 0;
  show = false;
  branch = '';

  constructor(private navService: StudyNavigationService, private controller: ActivateStudyService, private router: Router){
    
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.show = false;
        }
      });
    this.controller.play$.subscribe((p) => {
      if(p == this.show){
        return;
      }
      if(p){
        this.show = true;
        this.score = this.calculateScore(this.navService.calculateScore()) * 100;
        this.startScore = this.score;
        this.diff = 0;
      }else{
        this.show = false;
      }
    })

    this.navService.moveDetail$.subscribe((s) => {
      if(s){
        this.score = this.calculateScore(this.navService.calculateScore()) * 100;
        this.diff = this.score - this.startScore;
        let b = this.navService.calculateScore(s.position);
        this.branch = `(${b.total}/${b.mistakes})`;
      }
    });


  }

  calculateScore(s: any){
    return s.total / (s.total + s.mistakes);
  }

  isBetter(){
    return this.score > this.startScore;
  }

  isWorse() {
    return this.score < this.startScore;
  }
}
