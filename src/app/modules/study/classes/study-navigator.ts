import { Move, Position, Study } from "../../../chess-logic/models";

export class StudyNavigator {

  private studyPointer: StudyPointer;

  constructor(study: Study){
      this.studyPointer = new StudyPointer(null,study?.position);
  }

  peek = (): Move |null => {
    return this.studyPointer.peek();
  }

  getTitle = (): string => {
    return this.studyPointer.getTitle();
  }

  setTitle = (title: string): void => {
    this.studyPointer.setTitle(title);
  }

  getDescription = (): string => {
    return this.studyPointer.getDescription();
  }

  setDescription = (desc: string) => {
    this.studyPointer.setDescription(desc);
  }

  getVariations = (): string[] => {
    return this.studyPointer.getVariations();
  }

  goto = (name: string): Move | null => {
    let sp = this.studyPointer.goto(name);
    if(sp && sp.pointer){
      this.studyPointer = sp;
    }
    return this.studyPointer.peek();
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
    if(p.pointer instanceof Position && p.pointer.move){
      return this.getPreviousMovesHelper(p.parent, moves).concat([p.pointer.move]);
    }

    return moves;
  }

  next(name: string | null = null):  Move | null {
    let sp = this.studyPointer.next(name);
    if(sp.pointer){
      this.studyPointer = sp;
    }

    return this.studyPointer.peek();
  }
  previous():  Move | null {
    let sp = this.studyPointer.previous();
    if(sp){
      this.studyPointer = sp;
    }
    return this.studyPointer.peek();
  }
  first(){

  }
  last(){

  }

  addMove(move: Move){
    if(!this.hasNext(move.name ?? '-')){
      this.studyPointer = this.studyPointer.addMove(move);
    }
  }

  hasNext(name: string): boolean {
    return this.studyPointer.hasNext(name);
  }
}


class StudyPointer{
  parent: StudyPointer | null = null;
  pointer: Position | null = null;

  
  constructor(p: StudyPointer | null, pointer: Position | null = null){
    this.parent = p;
    this.pointer = pointer;
  }

  goto(name: string): StudyPointer | null{
    return this.gotoHelper(name, this);
  }

  gotoHelper(name: string, studyPointer: StudyPointer | null): StudyPointer | null {
    if(studyPointer?.pointer instanceof Position){
      if(studyPointer.pointer.move?.name == name){
        return studyPointer;
      }

      return studyPointer.gotoHelper(name, studyPointer?.parent ?? null);
    }

    return this;
  }

  hasNext(name: string): boolean {
    if(this.pointer instanceof Position){
      return this.pointer.positions.some(p => p.move?.name == name);
    }

    return false;
  }

  peek(): Move | null {
    if(this.pointer instanceof Position){
      return this.pointer.move;
    }

    return null;
  }

  next(name: string | null = null): StudyPointer {
    if(this.pointer instanceof Position){
      let position: Position | null;
      if(!name){
        position = this.pointer.positions[0];
      }else{
        position = this.pointer.positions.filter(c => c.move?.name == name)[0];
      }
      if(position){
        let studyPointer = new StudyPointer(this, position);
        return studyPointer;
      }
    }

    return this;
  }

  public previous(): StudyPointer | null {
    if(this.pointer instanceof Position){
      return this.parent
    }

    return this;
  }

  public getVariations(): string[] {
    if(this.pointer instanceof Position){
      return this.pointer.positions.map((c) => {
        return c.move?.name ?? '-';
      })
    }

    return [];
  }

  getTitle(): string {
    let title = '';
    let nav: StudyPointer | null = this;
    let p: Position | null = nav.pointer;
    while(title == '' && nav != null){
      console.log(p)
      title = p?.title ?? ''
      p = nav.parent?.pointer ?? null;
      nav = nav.parent
    }

    return title;
  }

  setTitle(title: string): void {
    if(this.pointer){
      this.pointer.title = title;
    }
  }

  getDescription(): string {
    return this.pointer?.description ?? '';
  }

  setDescription(desc: string): void {
    if(this.pointer){
      this.pointer.description = desc;
    }
  }

  addMove(move: Move): StudyPointer { 
    if(this.hasNext(move.name ?? '-')){
      return this;
    }else{
      if(this.pointer instanceof Position){
        return this.addToPosition(move);
      }
      return this;
    }
  }

  addToPosition(move: Move): StudyPointer{
    let p = <Position>this.pointer;

    let c = new Position();
    c.id = crypto.randomUUID();
    c.title = p.title;
    c.description = p.description;
    c.tags = p.tags;
    c.move = move;
    c.positions = []

    return this;
  }
}
