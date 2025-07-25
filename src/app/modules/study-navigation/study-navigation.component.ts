import { Component, Input, SimpleChanges, EventEmitter, Output, OnChanges } from '@angular/core';
import { Color, Move, MoveData, Position, Study } from '../../chess-logic/models';
import { SlicePipe } from '@angular/common';
import { StudyNavigator } from '../study/classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { FENConverter } from '../../chess-logic/FENConverter';
import { StudyNavigationService } from './study-navigation.service';
import { SettingsService } from '../settings/settings.service';
import { ActivateStudyService } from '../study/activate-study.service';

@Component({
  selector: 'app-study-navigation',
  templateUrl: './study-navigation.component.html',
  styleUrls: ['./study-navigation.component.css']
})
export class StudyNavigationComponent {

  //studyNav: StudyNavigator = new StudyNavigator(new Study());
  moveData: MoveData| null = null;
  @Input() onUpdate: (move: MoveData ) => void = () => {console.log('please provide study navigation with update callback')};
  moves: Move[] = [];
  showVariations: boolean = true;
  variations: MoveDetail[] = [];
  playing = false;

  constructor(private positionService: PositionService, private navService: StudyNavigationService, private settingsService: SettingsService,
    private activateStucyService: ActivateStudyService
  ){

    this.navService.moveDetail$.subscribe((s) => {
      if(s)
        this.onUpdate(s);
      this.updateVariations();
      return this.moveData = s;
    });

    this.settingsService.showVariations$.subscribe(m => this.showVariations = m);
    this.navService.study$.subscribe((s) => {
      this.updateVariations();
    })

    this.activateStucyService.play$.subscribe(p => {
      this.playing = p;
      this.showVariations = settingsService.showVariations() && !this.playing;
    })
  }

  determineFocus = (): number[] => {
    let x: number[] = [];
    let weight = this.navService.getTotalExcessWeightUpTree();
    for(let i = 0; i < weight; i+=5){
      x.push(0);
    }

    return x;
  }

  getMoveDetail = (): MoveDetail => {
    return {name:this.moveData?.move?.name ?? '-', isDirty: this.moveData?.position?.isDirty ?? false, position: this.moveData?.position };
  }

  //TODO: delete this
  refresh = (): void => {
    let player = FENConverter.getPlayer(this.moveData?.move?.fen ?? '- w')
;

      // this.onUpdate({
      //   studyId: this.studyNav.getStudy().id,
      //   studyTitle: this.studyNav.getStudy().title,
      //   move: this.studyNav.peek(),
      //   source: 'navigator',
      //   direction: 'next',
      //   player: player,
      //   extra: {}
      // });
  }

  first = (): void => {
    this.navService.first();
    this.updateVariations();
  }

  previous = (): void => {
    this.navService.previous();
    this.updateVariations();
  }

  next = (name: string | null = null, alwaysUpdate: boolean = false): void => {
    this.navService.next(name);
    this.updateVariations();
  }

  last(): void {

  }

  goto(name: string): void {
    this.navService.goto(name);
    this.updateVariations();
  }

  getPreviousMoves(): MoveDetail[][] {
    return this.navService.getPreviousMoves();
  }

  getTitle(): string | null {
    return this.navService.getTitle();
  }

  updateVariations():void {
    this.variations = this.navService.getVariations();
  }

}

export interface MoveDetail {
  name: string;
  isDirty: boolean;
  position: Position | null | undefined;
}