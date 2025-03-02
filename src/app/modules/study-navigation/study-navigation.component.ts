import { Component, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Continuation, Move, Position, Study } from '../../chess-logic/models';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-study-navigation',
  templateUrl: './study-navigation.component.html',
  styleUrls: ['./study-navigation.component.css']
})
export class StudyNavigationComponent {

  @Input() study: Study | null = null;
  @Input() onUpdate: (move: Move | null) => void = () => {console.log('please provide study navigation with update callback')};
  moves: Move[] = [];
  studyPointer: StudyPointer = new StudyPointer(null);

  public ngOnChanges(changes: SimpleChanges){
    if(this.study){
      this.studyPointer = new StudyPointer(null,this.study.continuation);
      this.studyPointer.pointer = this.study.continuation;
      this.studyPointer.listMoves()
    }
      this.study?.continuation?.movesToPosition.forEach(m => {
        this.moves.push(m)
      });
      
  }

  goto = (name: string): void => {
    let sp = this.studyPointer.goto(name);
    if(sp && sp.pointer){
      this.studyPointer = sp;
    }
    this.onUpdate(this.studyPointer.peek());

  }

  getPreviousMoves(): string[][] {
    //splice to dump the initial position
    let moves = this.getPreviousMovesHelper(this.studyPointer).splice(1);

    let moveNames: string[][] = [];
    for(let i = 0; i < moves.length; i++){
      if(i % 2){
        let moveIndex = moveNames[Math.floor(i / 2)];
        moveIndex.push(moves[i].name ?? '-')
      }else{
        moveNames.push([moves[i].name ?? '-'])
      }
    }

    return moveNames;
  }

  getPreviousMovesHelper(p: StudyPointer | null, moves: Move[] = []): Move[] {    
    if(!p){
      return moves;
    }
    if(p.pointer instanceof Continuation){
      let tempMoves:Move[] = [];
      for(let i = 0; i < p.index + 1; i++){
        tempMoves.push(p.pointer.movesToPosition[i]);
      }
      return this.getPreviousMovesHelper(p.parent, moves).concat(tempMoves);
    }
    if(p.pointer instanceof Position && p.pointer.move){
      return this.getPreviousMovesHelper(p.parent, moves).concat([p.pointer.move]);
    }

    return moves;
  }

  next(){
    let sp = this.studyPointer.next();
    if(sp.pointer){
      this.studyPointer = sp;
    }
    this.onUpdate(this.studyPointer.peek());
  }
  previous(){
    let sp = this.studyPointer.previous();
    if(sp){
      this.studyPointer = sp;
    }
    this.onUpdate(this.studyPointer.peek());
  }
  first(){

  }
  last(){

  }
}


class StudyPointer{
  parent: StudyPointer | null = null;
  pointer: Continuation | Position | null = null;
  index: number = 0;

  
  constructor(p: StudyPointer | null, pointer: Continuation | Position | null = null){
    this.parent = p;
    this.pointer = pointer;
    this.index = 0;
  }

  goto(name: string): StudyPointer | null{
    return this.gotoHelper(name, this);
  }

  gotoHelper(name: string, studyPointer: StudyPointer | null): StudyPointer | null {
    if(studyPointer?.pointer instanceof Continuation){
      let i = studyPointer.pointer.movesToPosition.findIndex(m => m.name == name);
      if(i > -1){
        studyPointer.index = i;
        console.log('found at',i)
        return studyPointer;
      }

      console.log('goto continuation parent')
      return studyPointer.gotoHelper(name, studyPointer.parent);
    }
    if(studyPointer?.pointer instanceof Position){
      if(studyPointer.pointer.move?.name == name){
        console.log('found in position')
        return studyPointer;
      }

      console.log('goto position parent')
      return studyPointer.gotoHelper(name, studyPointer?.parent ?? null);
    }

    console.log('uh oh')
    return this;
  }

  peek(): Move | null {
    if(this.pointer instanceof Continuation){
      return this.pointer.movesToPosition[this.index];
    }
    if(this.pointer instanceof Position){
      return this.pointer.move;
    }

    return null;
  }

  

  next(name: string | null = null): StudyPointer {
    if(this.pointer instanceof Continuation){
      this.index++;
      if(this.index < this.pointer.movesToPosition.length){
        return this;
      }
      
      this.index--;
      let studyPointer = new StudyPointer(this, this.pointer.position);
      return studyPointer;
    }
    if(this.pointer instanceof Position){
      if(!name){
        let continuation = this.pointer.continuations[0];
        let studyPointer = new StudyPointer(this, continuation);
        return studyPointer;
      }
      let continuation = this.pointer.continuations.filter(c => c.movesToPosition[0].name === name)[0];
      let studyPointer = new StudyPointer(this, continuation);
      return studyPointer;
    }

    return this;
  }

  public previous(): StudyPointer | null {
    if(this.pointer instanceof Continuation){
      console.log('cont')
      this.index--;
      if(this.index >= 0){
        return this;
      }
      
      this.index = 0;
      return this.parent;
    }
    if(this.pointer instanceof Position){
      return this.parent
    }

    return this;
  }

  public listMoves(): string[] {
    if(this.pointer instanceof Continuation){
      let move: Move = this.pointer?.movesToPosition[this.index];
      return [move?.name ?? '-'];
    }
    if(this.pointer instanceof Position){
      return this.pointer.continuations.map(c => c.movesToPosition[0].name ?? '-')
    }

    return [];
  }
}