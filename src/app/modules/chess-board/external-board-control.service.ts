import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import { Color, Move } from "../../chess-logic/models";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";
import { NavigationStart, Route, Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ExternalBoardControlService {
  private _clickSquare = new BehaviorSubject<Coord>({x:-1,y:-1});
  private perspective: Color = Color.White;

  destory$ = new Subject<void>();
    
  constructor(private studyNavService: StudyNavigationService, private router: Router){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.destory$.next();
      }
    });
    
    studyNavService.study$.pipe(takeUntil(this.destory$)).subscribe((s) => {
      if(s)
        this.perspective = s.perspective ?? Color.White;
    })
  }

  clickSquare$ = this._clickSquare.asObservable();

  click(x:number, y:number){
    this._clickSquare.next({x,y});
  }

  playMove(move:Move){
    if(move.from && move.to){
      let from = move.from;
      let to = move.to;

      if(move.name?.indexOf("o-o") == 0){
        console.log("castle problem")
      }

      
      if(move.name?.indexOf( "o-o-o") == 0){
        to = to.replace("h","f");
      }else if(move.name?.indexOf("o-o") == 0){
        to = to.replace("a","b");
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