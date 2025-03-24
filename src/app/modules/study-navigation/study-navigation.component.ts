import { Component, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Move, Position, Study } from '../../chess-logic/models';
import { SlicePipe } from '@angular/common';
import { StudyNavigator } from '../study/classes/study-navigator';

@Component({
  selector: 'app-study-navigation',
  templateUrl: './study-navigation.component.html',
  styleUrls: ['./study-navigation.component.css']
})
export class StudyNavigationComponent {

  @Input() studyNav: StudyNavigator = new StudyNavigator(new Study());
  @Input() onUpdate: (move: Move | null) => void = () => {console.log('please provide study navigation with update callback')};
  @Input() saveAction: () => void = () => {};
  moves: Move[] = [];
  showVariations: boolean = true;

  delete = (): void => {
    this.studyNav.deleteCurrentPosition();
    this.onUpdate(this.studyNav.peek());
  }

  getMoveDetail = (): MoveDetail => {
    return {name:this.studyNav.peek()?.name ?? '-', isDirty: this.studyNav.peekDirty() };
  }

  show(): void {
    this.showVariations = true;
  }

  hide(): void {
    this.showVariations = false;
  }

  first(): void {

  }

  previous(): void {
    let move = this.studyNav.previous();
    this.onUpdate(move);
  }

  next(name: string | null = null): void {
    let tempStudyPoint = this.studyNav.getPointer();

    let move = this.studyNav.next(name);

    if(tempStudyPoint != this.studyNav.getPointer()){
      this.onUpdate(move);
    }
  }

  last(): void {

  }

  goto(name: string): void {
    let move = this.studyNav.goto(name);
    this.onUpdate(move);
  }

  getPreviousMoves(): MoveDetail[][] {
    return this.studyNav.getPreviousMoves();
  }

  getTitle(): string {
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
}