import { Component } from '@angular/core';
import { Data, Game } from 'src/app/utilities/data';
import { StudyService } from '../../services/study.service';

@Component({
  selector: 'app-repertoire-menu',
  templateUrl: './repertoire-menu.component.html',
  styleUrls: ['./repertoire-menu.component.css']
})
export class RepertoireMenuComponent {

  previews: Game[] = [];

  constructor(private studyService: StudyService){
    this.init();
  }

  init(): void {
    this.studyService.getSimpleStudies().subscribe(s => {
        this.previews = [];
        s.forEach((study) => {
          console.log(study.id);
          this.previews.push(<Game>{
            title: study.title,
            opening: study.title,
            fen: study.fen,
            fromWhitePerspective: study.perspective == 0
          })
        } )
    });
  }

  public whiteGames(): Game[] {
    return this.previews.filter(p => p.fromWhitePerspective);
  }
  
  public blackGames(): Game[] {
    return this.previews.filter(p => !p.fromWhitePerspective);
  }
}
