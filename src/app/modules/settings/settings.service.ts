import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Study, MoveData } from "../../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _showVariations = new BehaviorSubject<boolean>(true);
  private _autoFavor = new BehaviorSubject<boolean>(true);
    private _pauseTime = new BehaviorSubject<number>(2500);

    showVariations$ = this._showVariations.asObservable();
    pauseTime$ = this._pauseTime.asObservable();
    autoFavor$ = this._autoFavor.asObservable();

    public showVariations = (show: boolean) => {
        this._showVariations.next(show);
        
    }

    public setPauseTime(t: number){
      this._pauseTime.next(t);
    }
    
    public autoFavor(t: boolean){
      this._autoFavor.next(t);
    }
}