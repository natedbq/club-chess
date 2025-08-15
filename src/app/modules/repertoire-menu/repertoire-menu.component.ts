import { Component } from '@angular/core';
import { StudyService } from '../../services/study.service';
import { Router } from '@angular/router';
import { Color, Move, MoveData } from '../../chess-logic/models';
import { NewStudyDialogComponent } from '../new-study-dialog/new-study-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog-component';
import { FloatingImageService } from '../../services/floating-image/floating-image.service';
import { withJsonpSupport } from '@angular/common/http';

interface Selection {
  name: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-repertoire-menu',
  templateUrl: './repertoire-menu.component.html',
  styleUrls: ['./repertoire-menu.component.css']
})
export class RepertoireMenuComponent {

  previews: MoveData[] = [];
  tags: Selection[] = [];

  constructor(private router: Router, private studyService: StudyService, private dialog: MatDialog){
    this.init();
  }

  init(): void {
    this.studyService.getSimpleStudies().subscribe(s => {
        this.previews = [];
        s = s.sort((a, b) => (new Date(a.lastStudied ?? '').getTime() ?? 0) - (new Date(b.lastStudied ?? '').getTime() ?? 0));
        s.forEach((study) => {
          study.tags.forEach((tag) => {
            if(!this.tags.some(t => t.name == tag)){
              this.tags.push({
                name: tag,
                isSelected: true
              });
            }
          })
          let move = new Move();
          move.fen = study.summaryFEN;
          move.name = '-';
          this.previews.push(<MoveData>{
            studyId: study.id,
            studyTitle: study.title,
            move: move,
            source: 'repertoire-menu',
            direction: 'preview',
            player: study.perspective,
            extra: {score: study.score, tags: study.tags, lastStudied: new Date(study.lastStudied ?? '')}
          })
        } )
    });
  }

  public delete(moveData: MoveData): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {data: {action: `Delete ${moveData.studyTitle}`}});

    dialogRef.afterClosed().subscribe(result => {
      if(result && moveData.studyId){
        this.studyService.deleteStudy(moveData.studyId).subscribe({
          complete: () => window.location.reload(),
          error: (e) => console.log(e)
        });
      }
    });
  }

  public whiteGames(): MoveData[] {
    return this.previews.filter(p => p.player == Color.White && (
      !this.tags.some(t => t.isSelected) 
      || p.extra.tags.length == 0 
      || this.tags.filter(t => t.isSelected).some(t => p.extra.tags.includes(t.name))));
  }
  
  public blackGames(): MoveData[] {
    return this.previews.filter(p => p.player == Color.Black && (
      !this.tags.some(t => t.isSelected) 
      || p.extra.tags.length == 0 
      || this.tags.filter(t => t.isSelected).some(t => p.extra.tags.includes(t.name))));
  }

  public loadStudy(id: string | null){
    if(id){
      this.router.navigate(['study/' + id]);
    }
  }

  public newStudy(): void {
      this.dialog.open(NewStudyDialogComponent);
  }
}
