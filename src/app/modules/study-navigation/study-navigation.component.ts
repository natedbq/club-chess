import { Component, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Continuation, Move, Position, Study } from '../../chess-logic/models';
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
  moves: Move[] = [];
  showVariations: boolean = true;

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
    let move = this.studyNav.next(name);
    this.onUpdate(move);
  }

  last(): void {

  }

  goto(name: string): void {
    let move = this.studyNav.goto(name);
    this.onUpdate(move);
  }

  getPreviousMoves(): string[][] {
    return this.studyNav.getPreviousMoves();
  }

  getTitle(): string {
    return this.studyNav.getTitle();
  }

  getVariations(): string[] {
    let variations = this.studyNav.getVariations();
    if(variations.length >= 2){
      return variations;
    }
    return [];
  }

}
