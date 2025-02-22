import { Component } from '@angular/core';
import { Data, Game } from 'src/app/utilities/data';

@Component({
  selector: 'app-repertoire-menu',
  templateUrl: './repertoire-menu.component.html',
  styleUrls: ['./repertoire-menu.component.css']
})
export class RepertoireMenuComponent {

  previews: Game[] = [];

  constructor(){
    this.init();
  }

  init(): void {
    this.previews = Data.getData();

  }

  public whiteGames(): Game[] {
    return this.previews.filter(p => p.fromWhitePerspective);
  }
  
  public blackGames(): Game[] {
    return this.previews.filter(p => !p.fromWhitePerspective);
  }
}
