import { Component } from '@angular/core';
import { PositionService } from '../../services/position.service';
import { SettingsService } from '../settings/settings.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { Color, Move, MoveData, Position } from '../../chess-logic/models';
import { ActivateStudyService } from '../study/activate-study.service';
import { NavigationStart, Router } from '@angular/router';
import { FIFOCache } from '../../utilities/fifo-cache';
import { columns } from '../chess-board/models';
import { BoardUtility } from '../../chess-logic/FENConverter';

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

  /**
   * 
   * I accidentally clicked to the next line and lost a position. I need to find a position where Na3 is played while a black Knight is on d3
   * "Na3 & [on=nd3]" => "{search clause} {operator} [on={FENchar}{coordinate}]"
   */

  parseSearch(){
    this.searchResults = [];
    let hasClauses = true;
    let remainingSearch = this.searchWord;
    let operator: string | null = null;
    while(hasClauses){
      let indexOfAnd = remainingSearch.indexOf('&&');
      let indexOfOr = remainingSearch.indexOf('||');
      if(indexOfAnd == -1 && indexOfOr == -1){
        hasClauses = false;
      }

      let current: string = '';
      let nextOperator: string | null = null;

      if(indexOfAnd == -1 && indexOfOr == -1){
        current = remainingSearch;
      }else if(indexOfAnd < indexOfOr || indexOfOr == -1){
        current = remainingSearch.substring(0, indexOfAnd);
        remainingSearch = remainingSearch.substring(indexOfAnd + 2);
        nextOperator = '&';
      }else if(indexOfOr < indexOfAnd || indexOfAnd == -1){
        current = remainingSearch.substring(0, indexOfOr);
        remainingSearch = remainingSearch.substring(indexOfOr + 2);
        nextOperator = '|';
      }

      this.search(current.trim(), operator);

      operator = nextOperator;
    }
  }

  search(searchWord: string, operator: string | null = null){
    if(searchWord.trim() == ''){
      return;
    }
    let root = this.navService.getStudy()?.position;
    let path = '';
    if(root){
      let matcher = this.matchWord;
      if(searchWord.trim() == '[title]')
        matcher = this.hasTitle;
      if(searchWord.trim() == '[desc]' || this.searchWord.trim() == '[description]')
        matcher = this.hasDescription;
      if(searchWord.trim() == '[tag]' || this.searchWord.trim() == '[tags]')
        matcher = this.hasTags;
      if(searchWord.trim() == '[inactive]')
        matcher = this.isNotActive;
      if(/\[on=\w\w\d\]/.test(searchWord.trim()))
        matcher = this.pieceOn;

      if(operator == '&'){
        this.filterResults(searchWord, matcher);
      }else{
        this.searchHelper(searchWord, root, path, null, matcher, operator);
      }
    }
  }


  filterResults(searchWord: string, matcher: (position: Position, searchWord: string | null) => boolean){
    this.searchResults = this.searchResults.filter(r => matcher(r.position, searchWord));
  }


  private searchHelper(searchWord: string, position: Position, path: string, title: string | null, matcher: (position: Position, searchWord: string | null) => boolean, operator: string|null = null){
    if(position.title != null && position.title.trim() != ''){
      title = position.title;
    }
    if(matcher(position, searchWord)){
      this.createResult(position, path, title);
    }
    
    position.positions.forEach(p => {
      this.searchHelper(searchWord, p, `${path},${p.move?.name}`, title, matcher);
    })
  }

  private createResult(position: Position, path: string, title: string|null){
    if(this.searchResults.some(r => r.position.id == position.id)){
      return;
    }
    let perspective = this.navService.getStudy()?.perspective;
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

  pieceOn = (position: Position, searchWord: string | null): boolean => {
    if(searchWord == null){
      return false;
    }


    let pieceSearchedFor = searchWord[4];
    let coord = searchWord.substring(5,7);
    let p = BoardUtility.pieceOn(coord, position.move?.fen ?? '');
    
    return p === pieceSearchedFor;
  }

  matchWord = (position: Position, searchWord: string | null): boolean => {
    let s = searchWord?.toLowerCase() ?? '';
    var wordMatch = (position.move?.name?.toLowerCase().includes(s) ?? false)
     || (position.move?.from?.toLowerCase().includes(s) ?? false)
     || (position.move?.to?.toLowerCase().includes(s) ?? false)
     || (position.title?.toLowerCase().includes(s) ?? false)
     || (position.description?.toLowerCase().includes(s) ?? false)
     || (position.tags.some(t => t.includes(s)));
    if(/^\w\w\d/.test(s)){
      s = `${s.substring(0,1)}x${s.substring(1)}`;
      wordMatch = wordMatch ||
          (position.move?.name?.toLowerCase().includes(s) ?? false)
        || (position.move?.from?.toLowerCase().includes(s) ?? false)
        || (position.move?.to?.toLowerCase().includes(s) ?? false)
        || (position.title?.toLowerCase().includes(s) ?? false)
        || (position.description?.toLowerCase().includes(s) ?? false);
    }

    return wordMatch;
  }

  hasTitle = (position: Position, searchWord: string | null = null): boolean => {
    return position.title ? true:false;
  }
  
  hasDescription = (position: Position, searchWord: string | null = null): boolean => {
    return position.description ? true:false;
  }
  
  hasTags = (position: Position, searchWord: string | null = null): boolean => {
    return position.tags.length > 0;
  }

  isNotActive = (position: Position, searchWord: string | null = null): boolean => {
    return !position.isActive;
  }
}

interface SearchResult {
  name: string;
  title: string | null;
  path: string;
  position: Position;
  moveData: MoveData;
}
