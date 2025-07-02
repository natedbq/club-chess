import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Study, MoveData } from "../../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _showVariations = new BehaviorSubject<boolean>(true);
  private _autoFavor = new BehaviorSubject<boolean>(true);
  private _showPlans = new BehaviorSubject<boolean>(true);
    private _pauseTime = new BehaviorSubject<number>(2.5);
    private _autoNextLine = new BehaviorSubject<boolean>(false);
    

    showVariations$ = this._showVariations.asObservable();
    pauseTime$ = this._pauseTime.asObservable();
    autoFavor$ = this._autoFavor.asObservable();
    showPlans$ = this._showPlans.asObservable();
    autoNextLine$ = this._autoNextLine.asObservable();

    public setShowVariations = (show: boolean) => {
        this._showVariations.next(show);
    }

    public setPauseTime(t: number){
      this._pauseTime.next(t);
    }
    
    public setAutoFavor(t: boolean){
      this._autoFavor.next(t);
    }

    public setShowPlans(b: boolean){
      this._showPlans.next(b);
    }

    public setAutoNextLine(b: boolean){
      this._autoNextLine.next(b);
    }

    public showPlans(){
      return this._showPlans.value;
    }

    public autoNextLine(){
      return this._autoNextLine.value;
    }
}

export class GlobalValues {
  static weights = {
    neglectScalar: 20,
    maxNeglectInDays: 15,
    mistakesScalr: 20,
    maxMistakes: 10,
    commonScalar: 5
  }
}