import { Continuation, Move, Position } from "../../chess-logic/models";
import { StudyPointer } from "../study-navigation/study-navigation.component";

export class StudyEditor {
    studyPointer: StudyPointer;
    constructor(sp: StudyPointer){
        this.studyPointer = sp;
    }

    public addMove(move: Move){
        let pointer = this.studyPointer.peek();
        if(!this.isNextMove(move)){
            console.log('is not next move');
        }else{
            console.log('is next move');
            if(pointer instanceof Continuation){
                this.addToContinuation(pointer, move);
            }
            if(pointer instanceof Position){
                this.addContinuationToPosition(pointer, move)
            }
        }
    }

    private isNextMove(move: Move): boolean{
        return false;
    }

    private addToContinuation(continuation: Continuation, move: Move){
        let index = this.studyPointer.index;
        if(index == continuation.movesToPosition.length - 1){
            console.log('maxed', continuation.movesToPosition[index].name, continuation.movesToPosition[continuation.movesToPosition.length - 1].name);
        }else{
            console.log(index, JSON.stringify(continuation.movesToPosition.map(m => m.name)), continuation.movesToPosition[index].name);
        }
    }

    private addContinuationToPosition(position: Position, move: Move){
        console.log('to pos');
    }
}
export class StudyNavigationComponent {

  @Input() studyPointer: StudyPointer = new StudyPointer(null);
  @Input() onUpdate: (move: Move | null) => void = () => {console.log('please provide study navigation with update callback')};
  moves: Move[] = [];

  public ngOnChanges(changes: SimpleChanges){
  }

  getTitle = (): string => {
    return this.studyPointer.getTitle();
  }

  getVariations = (): string[] => {
    return this.studyPointer.getVariations();
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

  next(name: string | null = null){
    let sp = this.studyPointer.next(name);
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


export class StudyPointer{
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
        return studyPointer;
      }

      return studyPointer.gotoHelper(name, studyPointer.parent);
    }
    if(studyPointer?.pointer instanceof Position){
      if(studyPointer.pointer.move?.name == name){
        return studyPointer;
      }

      return studyPointer.gotoHelper(name, studyPointer?.parent ?? null);
    }

    return this;
  }

  hasNext(name: string): boolean {
    if(this.pointer instanceof Continuation){
      if(this.index + 1 == this.pointer.movesToPosition.length - 1){
        return this.pointer.position?.move?.name == name
      }

      return this.pointer.movesToPosition[this.index + 1 ].name == name;
    }
    if(this.pointer instanceof Position){
      
      return this.pointer.continuations.some(c => c.movesToPosition[0].name == name)
    }

    return false;
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
      let continuation: Continuation | null;
      if(!name){
        continuation = this.pointer.continuations[0];
      }else{
        continuation = this.pointer.continuations.filter(c => (c.movesToPosition.length && c.movesToPosition[0].name === name) || c.position?.move?.name === name)[0];
      }
      
      if(continuation && continuation.movesToPosition && !continuation.movesToPosition.length){
        return new StudyPointer(this, continuation.position)
      }

      let studyPointer = new StudyPointer(this, continuation);
      return studyPointer;
    }

    return this;
  }

  public previous(): StudyPointer | null {
    if(this.pointer instanceof Continuation){
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

  public getVariations(): string[] {
    if(this.pointer instanceof Position){
      return this.pointer.continuations.map((c) => {
        if(c.movesToPosition.length == 0){
          return c.position?.move?.name ?? '-';
        }

        return c.movesToPosition[0].name ?? '-';
      })
    }

    return [];
  }

  getTitle(): string {
    if(this.pointer instanceof Continuation){
      let parent = this.parent?.pointer;
      if(parent instanceof Position){
        return parent.title ?? '-';
      }
    }
    if(this.pointer instanceof Position){
      return this.pointer.title ?? '-';
    }

    return 'Chess';
  }

  addMove(move: Move): void { 
    if(this.hasNext(move.name ?? '-')){
      return 
    }else{
      
    }
  }
}
