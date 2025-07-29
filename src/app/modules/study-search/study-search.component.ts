import { Component } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { SettingsService } from '../settings/settings.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { Color, Move, MoveData, Position } from '../../chess-logic/models';
import { ActivateStudyService } from '../study/activate-study.service';
import { NavigationStart, Router } from '@angular/router';
import { FIFOCache } from '../../utilities/fifo-cache';
import { columns } from '../chess-board/models';

@Component({
  selector: 'app-study-search',
  templateUrl: './study-search.component.html',
  styleUrls: ['./study-search.component.css']
})
export class StudySearchComponent {

  searchWord = '';
  searchResults: SearchResult[] = [];
  constructor(private navService: StudyNavigationService, private router: Router, private studyActivation: ActivateStudyService,
    private settings: SettingsService
  ){
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.searchWord = '';
        }
      });

      this.studyActivation.play$.subscribe(s => {
        this.searchResults = [];
        this.searchWord = '';
      });
  }

  select(result: SearchResult){
    let moves = result.path.split(",");
    this.navService.first();

    this.makeMove(moves, 0);
  }

  private makeMove(path: string[], index: number){
    let diff = path.length - index;
    let speed = 1;
    let base = 500;
    if(diff > 5){
      speed = 2;
    }
    if(diff > 10){
      speed = 3;
    }
    if(diff > 15){
      speed = 5;
    }
    if(this.settings.fastForward()){
      speed = 100;
    }
    let move = path[index];
    this.navService.next(move);
    if(index < path.length - 1){
      setTimeout(() => {
        this.makeMove(path, index + 1);
      }, base / speed);
    }
  }

  search(){
    this.searchResults = [];
    if(this.searchWord.trim() == ''){
      return;
    }
    let root = this.navService.getStudy()?.position;
    let path = '';
    if(root){
      let matcher = this.matchWord;
      if(this.searchWord.trim() == '[title]')
        matcher = this.hasTitle;
      if(this.searchWord.trim() == '[desc]' || this.searchWord.trim() == '[description]')
        matcher = this.hasDescription;
      if(this.searchWord.trim() == '[tag]' || this.searchWord.trim() == '[tags]')
        matcher = this.hasTags;

      this.searchHelper(this.searchWord, root, path, null, matcher);
    }
  }




  private searchHelper(searchWord: string, position: Position, path: string, title: string | null, matcher: (position: Position) => boolean){
    if(position.title != null && position.title.trim() != ''){
      title = position.title;
    }
    if(matcher(position)){
      this.createResult(position, path, title);
    }
    
    position.positions.forEach(p => {
      
      this.searchHelper(searchWord, p, `${path},${p.move?.name}`, title, matcher);
    })
  }

  private createResult(position: Position, path: string, title: string|null){
    let perspective = this.navService.getStudy()?.perspective;
    console.log(Color.White, Color.Black, perspective)
    this.searchResults.push({
      name: position.move?.name ?? `Result ${this.searchResults.length + 1}`,
      path: path,
      position: position,
      title: title,
      moveData: {
        move: position.move,
        studyId: null,
        studyTitle: null,
        source: null,
        direction: null,
        player: perspective ?? Color.White,
        extra: null,
        position: position
      }
    });
  }

  matchWord = (position: Position): boolean => {
    let s = this.searchWord;
    var wordMatch = (position.move?.name?.toLowerCase().includes(s) ?? false)
     || (position.move?.from?.toLowerCase().includes(s) ?? false)
     || (position.title?.toLowerCase().includes(s) ?? false)
     || (position.description?.toLowerCase().includes(s) ?? false);
    if(/^\w\w\d/.test(this.searchWord)){
      s = `${this.searchWord.substring(0,1)}x${this.searchWord.substring(1)}`;
      wordMatch = wordMatch ||
          (position.move?.name?.toLowerCase().includes(s) ?? false)
        || (position.move?.from?.toLowerCase().includes(s) ?? false)
        || (position.title?.toLowerCase().includes(s) ?? false)
        || (position.description?.toLowerCase().includes(s) ?? false);
    }

    return wordMatch;
  }

  hasTitle = (position: Position): boolean => {
    return position.title ? true:false;
  }
  
  hasDescription = (position: Position): boolean => {
    return position.description ? true:false;
  }
  
  hasTags = (position: Position): boolean => {
    return position.tags.length > 0;
  }
}

interface SearchResult {
  name: string;
  title: string | null;
  path: string;
  position: Position;
  moveData: MoveData;
}
