import { Component } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, Move, MoveData } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { StudyNavigationService } from '../study-navigation/study-navigation.service';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.css']
})
export class DevToolsComponent {

  moveData: MoveData | null = null;

  constructor(private router: Router, private studyNavService: StudyNavigationService){
    this.studyNavService.moveDetail$.subscribe(m => this.moveData = m);
  }

  public getMoveNumber(){
    return this.studyNavService.getPreviousMoves().length;
  }
}
