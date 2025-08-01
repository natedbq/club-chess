import { Move, Position, Study } from "../../../chess-logic/models";
import { MoveDetail } from "../../study-navigation/study-navigation.component";

export class StudyNavigator {

  private studyPointer: StudyPointer;
  private study: Study;

  constructor(study: Study){
      this.studyPointer = new StudyPointer(null,study?.position);
      this.study = study;
  }

  deleteCurrentPosition = (): void => {
    if(this.peek()?.name == '-'){
      return;
    }

    if(this.studyPointer.parent){
      let moveToDelete = this.peek()?.name;
      this.studyPointer = this.studyPointer.parent;
      if(moveToDelete){
        this.studyPointer.deletePosition(moveToDelete);
      }
    }
  }

  isStudyDirty = (): boolean => {
    return this.study.isDirty;
  }

  getStudy = (): Study  => {
    let firstPosition = this.studyPointer.getRoot();
    this.study.position = firstPosition;
    return this.study;
  }

  peekDirty = (): boolean => {
    return this.studyPointer.peekDirty();
  }

  peek = (): Move |null => {
    return this.studyPointer.peek();
  }

  canBeKey = (): boolean => {
    return this.studyPointer.canBeKey();
  }

  getTitle = (): string | null => {
    let title = this.studyPointer.getTitle();
    return title ?? this.study.title;
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

  getVariations = (): MoveDetail[] => {
    return this.studyPointer.getVariations();
  }

  isVariation = (): boolean => {
    let parent = this.studyPointer.parent;
    if(parent){
      return parent.getVariations().length > 1;
    }
    return false;
  }

  addWeightToTree = (w: number): void => {
    let pointer = this.getPointer();
    if(pointer.pointer){
      pointer.pointer.weight += w;
    }
    this.addWeightToTreeHelper(pointer, w);
  }

  private addWeightToTreeHelper = (pointer: StudyPointer | null, w: number): void => {
    if(pointer){
      let variations = pointer?.getVariations();
      if(variations.length > 1){
        variations.forEach(v => {
          if(v.position?.weight){
            v.position.weight += w;
          }
        })
      }

      variations.forEach(v => {
        this.addWeightToTreeHelper(pointer.next(v.name), w);
      })
    }
  }

  getTotalExcessWeightUpTree = (): number => {
    let pointer: StudyPointer | null = this.getPointer();
    let weight = 0;
    while(pointer){
      if(pointer.pointer){
        weight += Math.max(0, pointer.pointer?.weight - 1);
      }
      pointer = pointer.parent;
    }

    return weight;
  }

  getTotalExcessWeightInTree = (name: string | null = null): number => {
    let pointer = this.studyPointer;
    if(name){
      pointer = pointer.next(name);
    }
    let weight = this.getTotalExcessWeightInTreeHelper(pointer, pointer.pointer?.weight ?? 1);

    return weight;

  }

  private getTotalExcessWeightInTreeHelper = (pointer: StudyPointer | null, weight: number): number => {
    if(!pointer?.pointer){
      return 0;
    }


    pointer.getVariations().forEach(v => {
      weight += Math.max(0, this.getTotalExcessWeightInTreeHelper(pointer.next(v.name), (v.position?.weight ?? 1) - 1))
    });

    return weight;
  }

  public printTree() {
    this.printTreeHelper(this.getPointer(), 0);
  }

  private printTreeHelper(p: StudyPointer, depth: number){
    let s = '';
    for(let i = 0; i < depth; i++){
      s += '| ';
    }
    s += '| ' + p.pointer?.move?.name + ' '+ p.pointer?.weight;
     
    p.getVariations().forEach(v => {
      this.printTreeHelper(p.next(v.name), depth+1);
    })

    console.log(s);
  }

  getHighestWeightInTree = (name: string | null = null): number => {
    let pointer = this.studyPointer;
    if(name){
      pointer = pointer.next(name);
    }
    return this.getHighestWeightInTreeHelper(pointer);
  }

  private getHighestWeightInTreeHelper = (pointer: StudyPointer | null): number => {
    if(!pointer?.pointer){
      return 0;
    }

    let weight = pointer.pointer.weight;

    pointer.getVariations().forEach(v => {
      weight = Math.max(weight, this.getHighestWeightInTreeHelper(pointer.next(v.name)));
    });

    return weight;
  }

  goto = (name: string): Move | null => {
    let sp = this.studyPointer.goto(name);
    if(sp && sp.pointer){
      this.studyPointer = sp;
    }
    return this.studyPointer.peek();
  }

  getPreviousMoves = (): MoveDetail[][] =>  {
    //splice to dump the initial position
    let moves = this.getPreviousMovesHelper(this.studyPointer).splice(1);

    let moveNames: MoveDetail[][] = [];
    for(let i = 0; i < moves.length; i++){
      if(i % 2){
        let moveIndex = moveNames[Math.floor(i / 2)];
        moveIndex.push(moves[i])
      }else{
        moveNames.push([moves[i]])
      }
    }

    return moveNames;
  }

  getPreviousMovesHelper = (p: StudyPointer | null, moves: MoveDetail[] = []): MoveDetail[] =>  {    
    if(!p){
      return moves;
    }
    if(p.pointer instanceof Position && p.pointer.move){
      return this.getPreviousMovesHelper(p.parent, moves).concat([{name:p.pointer.move.name ?? '-', isDirty: p.pointer.isDirty, position: p.pointer}]);
    }

    return moves;
  }

  next = (name: string | null = null):  Move | null => {
    let sp = this.studyPointer.next(name);
    if(sp.pointer){
      this.studyPointer = sp;
    }
    
    return this.studyPointer.peek();
  }
  previous = ():  Move | null =>  {
    let sp = this.studyPointer.previous();
    if(sp){
      this.studyPointer = sp;
    }
    return this.studyPointer.peek();
  }
  first = (): Move | null => {
    let sp = this.studyPointer.first();
    if(sp){
      this.studyPointer = sp;
    }
    return this.studyPointer.peek();
  }
  last(){

  }

  addMove = (move: Move) => {
    if(!this.hasNext(move.name ?? '-')){
      this.studyPointer = this.studyPointer.addMove(move);
    }
  }

  hasNext = (name: string): boolean => {
    return this.studyPointer.hasNext(name);
  }

  getPointer = (): StudyPointer => {
    return this.studyPointer;
  }
}


class StudyPointer{
  parent: StudyPointer | null = null;
  pointer: Position | null = null;

  
  constructor(p: StudyPointer | null, pointer: Position | null = null){
    this.parent = p;
    this.pointer = pointer;
  }

  goto = (name: string): StudyPointer | null => {
    return this.gotoHelper(name, this);
  }

  gotoHelper = (name: string, studyPointer: StudyPointer | null): StudyPointer | null  => {
    if(studyPointer?.pointer instanceof Position){
      if(studyPointer.pointer.move?.name == name){
        return studyPointer;
      }

      return studyPointer.gotoHelper(name, studyPointer?.parent ?? null);
    }

    return this;
  }

  hasNext = (name: string): boolean  => {
    if(this.pointer instanceof Position){
      return this.pointer.positions.some(p => p.move?.name == name);
    }

    return false;
  }

  peekDirty(): boolean {
    return this.pointer?.isDirty ?? false;
  }

  peek = (): Move | null  => {
    if(this.pointer instanceof Position){
      return this.pointer.move;
    }

    return null;
  }

  canBeKey = (): boolean  => {
    let nav: StudyPointer | null = this.parent;
    let canBeKeyPosition = true;
    while(nav != null){
      canBeKeyPosition = canBeKeyPosition && (nav.pointer?.positions.length ?? 0) <= 1;
      nav = nav.parent
    }

    return canBeKeyPosition;
  }

  next = (name: string | null = null): StudyPointer =>  {
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

  public previous = (): StudyPointer | null =>  {
    if(this.pointer instanceof Position){
      return this.parent
    }

    return this;
  }

  public first = (): StudyPointer | null => {
    let nav: StudyPointer | null = this;
    while(nav != null){
      if(nav.parent == null){
        break;
      }
      nav = nav.parent
    }

    return nav;
  }

  public getVariations = (): MoveDetail[]  => {
    if(this.pointer instanceof Position){
      return this.pointer.positions.map((c) => {
        return {name: c.move?.name ?? '-', isDirty: c.isDirty ?? false, position: c};
      })
    }

    return [];
  }

  getTitle = (): string | null =>  {
    let title = '';
    let nav: StudyPointer | null = this;
    let p: Position | null = nav.pointer;
    while(title == '' && nav != null){
      title = p?.title ?? ''
      p = nav.parent?.pointer ?? null;
      nav = nav.parent
    }

    return title == '' ? null : title;
  }

  setTitle = (title: string): void =>  {
    if(this.pointer){
      this.pointer.title = title;
      this.pointer.isDirty = true;
    }
  }

  getDescription = (): string  => {
    return this.pointer?.description ?? '';
  }

  setDescription = (desc: string): void =>  {
    if(this.pointer){
      this.pointer.description = desc;
      this.pointer.isDirty = true;
    }
  }

  addMove = (move: Move): StudyPointer  => { 
    if(this.hasNext(move.name ?? '-')){
      return this;
    }else{
      if(this.pointer instanceof Position){
        return this.addToPosition(move);
      }
      return this;
    }
  }

  deletePosition = (name: string): void =>  {
    let index = -1;
    if(this.pointer){
      for(let i = 0; i < this.pointer.positions.length; i++){
        let p = this.pointer.positions[i];
        if(p.move?.name == name){
          index = i;
        }
      }

      if(index >= 0){
        this.pointer.positions = this.pointer.positions.slice(0,index).concat(this.pointer.positions.slice(index+1))
      }

    }
  }


  addToPosition = (move: Move): StudyPointer => {
    let p = <Position>this.pointer;

    let c = new Position();
    c.id = crypto.randomUUID();
    c.tags = p.tags;
    c.move = move;
    c.positions = []
    c.isDirty = true;
    c.parentId = p.id;

    p.positions.push(c);

    return this;
  }

  getRoot = (): Position | null  => {
    let nav: StudyPointer | null = this;
    let p: Position | null = nav.pointer;
    while(nav != null){
      p = nav.parent?.pointer ?? p;
      nav = nav.parent
    }

    return p;
  }
}
