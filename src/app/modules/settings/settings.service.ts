import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Study, MoveData } from "../../chess-logic/models";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
    private _showVariations = new BehaviorSubject<boolean>(true);

    showVariations$ = this._showVariations.asObservable();

    public showVariations = (show: boolean) => {
        this._showVariations.next(show);
        
    }
}