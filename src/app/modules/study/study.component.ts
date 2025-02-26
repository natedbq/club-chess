import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Color, Study } from '../../chess-logic/models';
import { StudyService } from '../../services/study.service';
import { Game } from '../../utilities/data';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class StudyComponent implements OnInit {
    study: Study | null = null;
    game: Game | null = null;
    isWhitePerspective: boolean = true;

    constructor(private route: ActivatedRoute, private studyService: StudyService) {
      let studyId = this.route.snapshot.paramMap.get('id');
      if(studyId){
        this.studyService.getStudy(studyId).subscribe(s => {
          this.study = s;
          this.isWhitePerspective = s.perspective == Color.White;
          this.game = <Game>{
            studyId: s.id,
            title: s.title,
            opening: s.title,
            fen: s.continuation.position.fen,
            fromWhitePerspective: s.perspective == Color.White
          };

        });
      }
    }

    ngOnInit(): void {
      
    }
}
