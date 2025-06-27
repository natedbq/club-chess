import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Move } from "../../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class ExternalBoardControlService {
  private _clickSquare = new BehaviorSubject<Coord>({x:-1,y:-1});
    

  clickSquare$ = this._clickSquare.asObservable();

  click(x:number, y:number){
    this._clickSquare.next({x,y});
  }

  playMove(move:Move){
    if(move.from && move.to){
      let from = move.from;
      let to = move.to;

      if(move.name == "o-o"){
        to = to.replace("a","b");
      }
      if(move.name == "o-o-o"){
        to = to.replace("h","f");
      }
      let x1 = "abcdefgh".indexOf(from[0]);
      let y1 = (Number(from[1]) - 1);
      let x2 = "abcdefgh".indexOf(to[0]);
      let y2 = (Number(to[1]) - 1);

      this._clickSquare.next({x:x1,y:y1});
      this._clickSquare.next({x:x2,y:y2});
    }
  }
}

export interface Coord {
    x: number;
    y: number;
}