import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Color } from '../../chess-logic/models';

@Injectable({
  providedIn: 'root'
})
export class FloatingImageService {

  private _visible = new BehaviorSubject<boolean>(false);
  private _src = new BehaviorSubject<string>('');
  private _position = new BehaviorSubject<{ top: number; left: number }>({ top: 0, left: 0 });
  private _evaluation = new BehaviorSubject<string | null>(null);

  visible$ = this._visible.asObservable();
  src$ = this._src.asObservable();
  position$ = this._position.asObservable();
  evaluation$ = this._evaluation.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.hideImage(); // <-- clear image on route change
      }
    });
  }

  isVisible(){
    return this._visible.value;
  }
  showImage(src: string, top: number, left: number, evaluation: string|null = null) {
    this._src.next('assets/emotes/' + src);
    this._position.next({ top, left });
    this._visible.next(false);
    this._evaluation.next(evaluation);
    setTimeout(() => {
      this._visible.next(true);
    }, 10);
  }

  hideImage() {
    this._visible.next(false);
  }
}
