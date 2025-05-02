import { Component, Input, SimpleChanges, EventEmitter, Output, OnChanges } from '@angular/core';
import { Color, Move, MoveData, Position, Study } from '../../chess-logic/models';
import { SlicePipe } from '@angular/common';
import { StudyNavigator } from '../study/classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { FENConverter } from '../../chess-logic/FENConverter';
import { StudyController } from '../study/study.component';
import { StudyNavigationService } from './study-navigation.service';

@Component({
  selector: 'app-study-navigation',
  templateUrl: './study-navigation.component.html',
  styleUrls: ['./study-navigation.component.css']
})
export class StudyNavigationComponent implements OnChanges {

  //studyNav: StudyNavigator = new StudyNavigator(new Study());
  moveData: MoveData| null = null;
  @Input() controller: StudyController | null = null;
  @Input() onUpdate: (move: MoveData ) => void = () => {console.log('please provide study navigation with update callback')};
  @Input() saveAction: () => void = () => {};
  moves: Move[] = [];
  showVariations: boolean = true;

  constructor(private positionService: PositionService, private navService: StudyNavigationService){

    this.navService.moveDetail$.subscribe((s) => {
      if(s)
        this.onUpdate(s)
      return this.moveData = s;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.controller){
      this.controller.next = this.next;
      this.controller.getVariations = this.getVariations;
      this.controller.first = this.first;
      this.controller.previous = this.previous;
      this.controller.refresh = this.refresh;
    }
  }

  determineFocus = (): number[] => {
    let x: number[] = [];
    let weight = this.navService.getTotalExcessWeightUpTree();
    for(let i = 0; i < weight; i+=5){
      x.push(0);
    }

    return x;
  }

  setFEN = (): void => {
    this.navService.setSummaryFEN();
  }

  delete = (): void => {
    this.navService.deleteCurrentPosition();
  }

  getMoveDetail = (): MoveDetail => {
    return {name:this.moveData?.move?.name ?? '-', isDirty: this.moveData?.position.isDirty ?? false, position: this.moveData?.position };
  }

  show(): void {
    this.showVariations = true;
  }

  hide(): void {
    this.showVariations = false;
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
  }

  previous = (): void => {
    this.navService.previous();
  }

  next = (name: string | null = null, alwaysUpdate: boolean = false): void => {
    this.navService.next(name);
  }

  last(): void {

  }

  goto(name: string): void {
    this.navService.goto(name);
  }

  getPreviousMoves(): MoveDetail[][] {
    return this.navService.getPreviousMoves();
  }

  getTitle(): string | null {
    return this.navService.getTitle();
  }

  getVariations(): MoveDetail[] {
    let variations = this.navService.getVariations();
    if(variations.length >= 2){
      return variations;
    }
    return [];
  }

}

export interface MoveDetail {
  name: string;
  isDirty: boolean;
  position: Position | null | undefined;
}