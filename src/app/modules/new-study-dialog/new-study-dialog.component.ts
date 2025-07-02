import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Color, Move, Position, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { FormsModule } from '@angular/forms';
import { PositionService } from '../../services/position.service';

@Component({
  selector: 'app-new-study-dialog',
  templateUrl: './new-study-dialog.component.html',
  styleUrls: ['./new-study-dialog.component.css'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, CommonModule, FormsModule]
})
export class NewStudyDialogComponent {
  perspective = 'w';
  title: string = "Untitled";
  constructor(private dialog: MatDialog,
      private router: Router,
      private studyService: StudyService,
      private positionService: PositionService){

  }

  create(): void {
    if(this.title == ""){
      return;
    }
    let study = new Study();
    study.id = crypto.randomUUID();
    study.title = this.title;
    study.description = "";
    study.perspective = this.perspective == 'w' ? Color.White : Color.Black;
    let position = new Position();
    study.position = position;
    study.summaryFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    position.id = crypto.randomUUID();
    position.title = "";
    position.description = "";
    position.tags = [];
    position.move = new Move();
    position.move.to = '';
    position.move.from = '';
    position.move.name = '-';
    position.move.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    position.mistakes = 0;
    position.plans = '';
    position.lastStudied = new Date();
    position.isKeyPosition = false;
    position.positions = [];

    study.positionId = position.id;

    this.studyService.saveStudy(study).subscribe({
      complete: () => {
        this.positionService.save(position).subscribe({
          complete: () => {
            window.location.reload();
          },
          error: (e) => {
            console.log(e);
          }
        });
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  cancel(): void {

  }
}
