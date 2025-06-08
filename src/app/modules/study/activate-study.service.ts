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

    play$ = this._play.asObservable();

    public isActive(){
        return this._play.value;
    }

    public startStudy(){
        this._play.next(true);
    }

    public stopStudy(){
        this._play.next(false);
    }
}