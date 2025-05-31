import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, lastValueFrom, Observable, of, Subscription } from 'rxjs';
import { Study, Move, Position, MoveData } from '../../chess-logic/models';
import { MoveDetail } from './study-navigation.component';
import { FENConverter } from '../../chess-logic/FENConverter';
import { StudyService } from '../../services/study.service';
import { PositionService } from '../../services/position.service';

@Injectable({
  providedIn: 'root'
})
export class StudyNavigationService {
    private _study = new BehaviorSubject<Study|null>(null);
    private _moveDetail = new BehaviorSubject<MoveData | null>(null);
    private _proposedMove = new BehaviorSubject<MoveData | null>(null);

    private studyPointer: StudyPointer | null;
    private study: Study | null;
    private moveDetail: MoveData | null = null;

    study$ = this._study.asObservable();
    moveDetail$ = this._moveDetail.asObservable();
    proposedMove$ = this._proposedMove.asObservable();

    constructor(private router: Router, private studyService: StudyService, private positionService: PositionService) {
      this.studyPointer = new StudyPointer(null);
      this.study = null;
        this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
        }
        });
    }

    load = (id: string) => {
        return this.studyService.getStudy(id).subscribe(s => {
            this.study = s;
  
            if(this.study.positionId){
                return this.positionService.getByParentId(this.study.positionId, 5).subscribe(children => {
                    if(this.study?.position?.positions){
                        this.study.position.positions = children;
                    }

                    this.studyPointer = new StudyPointer(null, this.study?.position);
                    this._study.next(this.study);
                    this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'load');
                    
                    return s;
                });
            }
            return of();
        });
    }

    saveStudy = (): Observable<Object[]> => {
      let saveTasks: Observable<Object>[] = [];

      let position = this.study?.position;

      if(this.study){
        let p = this.studyService.saveStudy(this.study);
        p.subscribe({
          
          complete: () => console.log('Study saved'),
          error : (e) => console.error('Error saving study:', e)
        }
        );
        saveTasks.push(p);
      }

      if(position){
        let p = this.positionService.save(position);
        p.subscribe({
          
          complete: () => console.log('Positions saved'),
          error : (e) => console.error('Error saving position:', e)
        }
        );
        saveTasks.push(p);
      }

      return forkJoin(saveTasks);
    }

    setSummaryFEN() {
      if(this.moveDetail?.position?.move && this.study){
        this.study.summaryFEN = this.moveDetail.position.move.fen;
        return this.saveStudy();
      }
      return of();
    }

    isDirty = (): boolean => {
      let firstPosition = this.studyPointer?.getRoot();
      let isDirty = this.isDirtyHelper(firstPosition ?? null);

      return isDirty;
    }

    private isDirtyHelper = (position: Position | null): boolean => {
      if(!position){
        return false;
      }

            
      let isDirty = position.isDirty;
      for(let i = 0; i < position.positions.length; i++){
        if(isDirty){
          break;
        }
        isDirty = isDirty || this.isDirtyHelper(position.positions[i]);
      }

      return isDirty;
    }

    makeMove = (position: Position | null, source: string, direction: string, extra: any = null): void => {
      if(position){
        let movedata: MoveData = {
            studyId: this.study?.id ?? null,
            studyTitle: this.study?.title ?? null,
            move: position.move,
            source: source,
            direction: direction,
            player: FENConverter.getPlayer(position.move?.fen ?? '- w'),
            extra: extra,
            position: position
        }; 
        this.moveDetail = movedata;
        this._moveDetail.next(movedata);
      }
    }

    emitNextMove = (moveData: MoveData) => {
      this._proposedMove.next(moveData);
      // let extra = moveData.extra ?? {};
      // if(moveData.move){
      //   extra.from = moveData.move.from;
      //   extra.to = moveData.move.to;
      // }

      // if(this.studyPointer && moveData.move){
      //   if(this.studyPointer.hasNext(moveData.move?.name ?? '-')){
      //     extra.isNew = false;
      //     this.next(moveData.move.name, true);
      //   }else{
      //     extra.isNew = true;
      //     this.addMove(moveData.move);
      //     this.next(moveData.move.name, true);
      //   }
      // }

      // if(this.studyPointer?.pointer?.move && !this.studyPointer.pointer.move.from){
      //   this.studyPointer.pointer.move.from = moveData.move?.from ?? null;
      //   this.studyPointer.pointer.move.to = moveData.move?.to ?? null;
      //   this.studyPointer.pointer.isDirty = true;

      // }

      // if(!moveData.position){
      //   moveData.position = this.studyPointer?.pointer ?? undefined;
      // }

      // this.moveDetail = moveData;
      // this._moveDetail.next(moveData);
    }

    refresh = () => {
      this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'refresh');
    }

    deleteCurrentPosition = (): void => {
        if(this.peek()?.name == '-'){
          return;
        }
    
        let position = this.studyPointer?.pointer;
        if(this.studyPointer?.parent){
          this.studyPointer = this.studyPointer.parent;
          if(position?.id){
            this.studyPointer.deletePosition(position.move?.name ?? '-');
            this.positionService.delete(position.id).subscribe(r => console.log(position?.id, 'deleted'))
          }
        }

        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'delete');
      }
    
      isStudyDirty = (): boolean => {
        return this.study?.isDirty ?? false;
      }
    
      getStudy = (): Study | null  => {
        let firstPosition = this.studyPointer?.getRoot();
        if(this.study?.position)
            this.study.position = firstPosition ?? null;
        return this.study;
      }
    
      peekDirty = (): boolean => {
        return this.studyPointer?.peekDirty() || false;
      }
    
      peek = (): Move |null => {
        return this.studyPointer?.peek() ?? null;
      }

      getTitle = (): string | null => {
        let title = this.studyPointer?.getTitle();
        return title ?? this.study?.title ?? null;
      }
    
      setTitle = (title: string): void => {
        if(this.studyPointer)
            this.studyPointer.setTitle(title);
        
        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'setTitle');
      }
    
      getDescription = (): string => {
        return this.studyPointer?.getDescription() ?? '';
      }
    
      setDescription = (desc: string) => {
        if(this.studyPointer)
            this.studyPointer.setDescription(desc);
        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'setDescription');
      }
    
      getVariations = (): MoveDetail[] => {
        return this.studyPointer?.getVariations() ?? [];
      }
    
      isVariation = (): boolean => {
        let parent = this.studyPointer?.parent;
        if(parent){
          return parent.getVariations().length > 1;
        }
        return false;
      }
    
      clearWeights = (): void => {
        this.addWeightToTree(-1);
      }

      addWeightToTree = (w: number): void => {
        let pointer = this.getPointer();
        if(pointer?.pointer){
          if(w < 0){
            pointer.pointer.weight = 0;
          }else{
            pointer.pointer.weight += w;
          }
        }
        this.addWeightToTreeHelper(pointer, w);
        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'addWieghtToTree');
      }
    
      private addWeightToTreeHelper = (pointer: StudyPointer | null, w: number): void => {
        if(pointer){
          let variations = pointer?.getVariations();
          if(variations.length > 1){
            variations.forEach(v => {
              if(v.position?.weight){
                if(w < 0){
                  v.position.weight = 0;
                }else{
                  v.position.weight += w;
                }
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
        if(name && pointer){
          pointer = pointer.next(name);
        }
        let weight = this.getTotalExcessWeightInTreeHelper(pointer, pointer?.pointer?.weight ?? 1);
    
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
        return this.printTreeHelper(this.getPointer(), 0);
      }
    
      private printTreeHelper(p: StudyPointer | null, depth: number){
        if(p == null){
            return;
        }

        let s = '';
        for(let i = 0; i < depth; i++){
          s += '| ';
        }
        s += '| ' + p.pointer?.move?.name + ' '+ p.pointer?.weight;
         
        p.getVariations().forEach(v => {
          s += '\n'+this.printTreeHelper(p.next(v.name), depth+1);
        })
    
        return s;
      }
    
      getHighestWeightInTree = (name: string | null = null): number => {
        let pointer = this.studyPointer;
        if(name && pointer){
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
        let sp = this.studyPointer?.goto(name);
        if(sp?.pointer){
          this.studyPointer = sp;
        }

        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'goto');
        return this.studyPointer?.peek() ?? null;
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
    
      next = (name: string | null = null, silence: boolean = false):  Move | null => {
        let sp = this.studyPointer?.next(name);
        if(sp?.pointer){
          this.studyPointer = sp;
        }
        
        if(!silence){
          this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'next');
        }
        return this.studyPointer?.peek() ?? null;
      }
      previous = ():  Move | null =>  {
        let sp = this.studyPointer?.previous();
        if(sp){
          this.studyPointer = sp;
        }
        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'previous');
        return this.studyPointer?.peek() ?? null;
      }
      first = (): Move | null => {
        let sp = this.studyPointer?.first();
        if(sp){
          this.studyPointer = sp;
        }
        this.makeMove(this.studyPointer?.pointer ?? null, 'navigator', 'first');
        return this.studyPointer?.peek() ?? null;
      }
      last(){
    
      }
    
      addMove = (move: Move) => {
        if(!this.hasNext(move.name ?? '-') && this.studyPointer){
          this.studyPointer = this.studyPointer?.addMove(move);
        }
      }
    
      inLine = (name: string): boolean => {
        let positions = this.getPointer()?.parent?.pointer?.positions;
        if(positions){
          return positions.some(p => p.move?.name == name && !p.isDirty);
        }
        return false;
      }

      hasNext = (name: string): boolean => {
        return this.studyPointer?.hasNext(name) ?? false;
      }
    
      getPointer = (): StudyPointer | null => {
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

