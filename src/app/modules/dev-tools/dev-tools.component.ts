import { Component } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, Move, MoveData } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';
import { BoardUtility } from '../../chess-logic/FENConverter';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.css']
})
export class DevToolsComponent {

  moveData: MoveData | null = null;
  test: string = "";

  constructor(private router: Router, private studyNavService: StudyNavigationService){
    this.studyNavService.moveDetail$.subscribe(m => {
      this.moveData = m;
    });
  }

  public getMoveNumber(){
    return this.studyNavService.getPreviousMoves().length;
  }

  public getDescription() {
    let desc = this.studyNavService.getDescription();
    let ret = desc.substring(0, 30);
    if(desc.length > 30){
      ret += '...';
    }
    return ret;
  }
  

  getTree() {
    return this.studyNavService.printTree();
  }
  
}
