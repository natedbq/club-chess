import { Component, Input, SimpleChanges, EventEmitter, Output, OnChanges } from '@angular/core';
import { Color, Move, MoveData, Position, Study } from '../../chess-logic/models';
import { SlicePipe } from '@angular/common';
import { StudyNavigator } from '../study/classes/study-navigator';
import { PositionService } from '../../services/position.service';
import { FENConverter } from '../../chess-logic/FENConverter';
import { StudyController } from '../study/study.component';

@Component({
  selector: 'app-study-navigation',
  templateUrl: './study-navigation.component.html',
  styleUrls: ['./study-navigation.component.css']
})
export class StudyNavigationComponent implements OnChanges {

  @Input() studyNav: StudyNavigator = new StudyNavigator(new Study());
  @Input() controller: StudyController | null = null;
  @Input() onUpdate: (move: MoveData ) => void = () => {console.log('please provide study navigation with update callback')};
  @Input() saveAction: () => void = () => {};
  moves: Move[] = [];
  showVariations: boolean = true;

  constructor(private positionService: PositionService){

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

  delete = (): void => {
    let player = FENConverter.getPlayer(this.studyNav.peek()?.fen ?? '- w')
    let position = this.studyNav.getPointer().pointer;
    if(position?.id){
      this.studyNav.deleteCurrentPosition();
      this.positionService.delete(position.id).subscribe({
        error: (e) => {
          console.log(e);
        }
      });
      this.onUpdate({
        studyId: this.studyNav.getStudy().id,
        studyTitle: this.studyNav.getStudy().title,
        move: this.studyNav.peek(),
        source: 'navigator',
        direction: 'delete',
        player: player,
        extra: {}
      });
    }
  }

  getMoveDetail = (): MoveDetail => {
    return {name:this.studyNav.peek()?.name ?? '-', isDirty: this.studyNav.peekDirty(), position: this.studyNav.getPointer().pointer };
  }

  show(): void {
    this.showVariations = true;
  }

  hide(): void {
    this.showVariations = false;
  }

  refresh = (): void => {
    let player = FENConverter.getPlayer(this.studyNav.peek()?.fen ?? '- w')
;

      this.onUpdate({
        studyId: this.studyNav.getStudy().id,
        studyTitle: this.studyNav.getStudy().title,
        move: this.studyNav.peek(),
        source: 'navigator',
        direction: 'next',
        player: player,
        extra: {}
      });
  }

  first = (): void => {
    let player = FENConverter.getPlayer(this.studyNav.peek()?.fen ?? '- w')
    let tempStudyPoint = this.studyNav.getPointer();
    
    let move = this.studyNav.first();

    if(tempStudyPoint != this.studyNav.getPointer()){
      this.onUpdate({
        studyId: this.studyNav.getStudy().id,
        studyTitle: this.studyNav.getStudy().title,
        move: move,
        source: 'navigator',
        direction: 'next',
        player: player,
        extra: {}
      });
    }
  }

  previous = (): void => {
    let player = FENConverter.getPlayer(this.studyNav.peek()?.fen ?? '- w')
    let move = this.studyNav.previous();
    this.onUpdate({
      studyId: this.studyNav.getStudy().id,
      studyTitle: this.studyNav.getStudy().title,
      move: move,
      source: 'navigator',
      direction: 'back',
      player: player,
      extra: {}
    });
  }

  next = (name: string | null = null, alwaysUpdate: boolean = false): void => {
    let player = FENConverter.getPlayer(this.studyNav.peek()?.fen ?? '- w')
    let tempStudyPoint = this.studyNav.getPointer();

    let move = this.studyNav.next(name);

    if(tempStudyPoint != this.studyNav.getPointer() || alwaysUpdate){
      this.onUpdate({
        studyId: this.studyNav.getStudy().id,
        studyTitle: this.studyNav.getStudy().title,
        move: move,
        source: 'navigator',
        direction: 'next',
        player: player,
        extra: {}
      });
    }
  }

  last(): void {

  }

  goto(name: string): void {
    let move = this.studyNav.goto(name);
    let player = Color.White == FENConverter.getPlayer(this.studyNav.peek()?.fen ?? '-') ? Color.Black : Color.White
    this.onUpdate({
      studyId: this.studyNav.getStudy().id,
      studyTitle: this.studyNav.getStudy().title,
      move: move,
      source: 'navigator',
      direction: 'goto',
      player: player,
      extra: {}
    });
  }

  getPreviousMoves(): MoveDetail[][] {
    return this.studyNav.getPreviousMoves();
  }

  getTitle(): string | null {
    return this.studyNav.getTitle();
  }

  getVariations(): MoveDetail[] {
    let variations = this.studyNav.getVariations();
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