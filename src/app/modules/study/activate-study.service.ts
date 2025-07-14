import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { StudyNavigationService } from "../study-navigation/study-navigation.service";
import { BehaviorSubject } from "rxjs";
import { MoveDelegation, MoveDelegator } from "../../chess-logic/moveDelegator";
import { Color } from "../../chess-logic/models";
import { SettingsService } from "../settings/settings.service";

@Injectable({
  providedIn: 'root'
})
export class ActivateStudyService {
    private _play = new BehaviorSubject<boolean>(false);
    private _lockBoard = new BehaviorSubject<boolean>(false);
    private startTime: Date | null = null;

    play$ = this._play.asObservable();
    lockBoard$ = this._lockBoard.asObservable();

    public getStartTime() {
        return this.startTime;
    }

    public isActive(){
        return this._play.value;
    }

    public startStudy(){
        this._play.next(true);
        this.startTime = new Date();
    }

    public stopStudy(){
        this._play.next(false);
        this.startTime = null;
    }

    public lockBaord(){
        this._lockBoard.next(true);
    }

    public unlockBaord(){
        this._lockBoard.next(false);
    }

    public isBoardLocked(){
        return this._lockBoard.value;
    }
}