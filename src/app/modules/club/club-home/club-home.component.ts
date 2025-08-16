import { Component } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { map, Observable } from 'rxjs';
import { Club, Color, Move, MoveData, Study } from '../../../chess-logic/models';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

class StudyCard extends Study {
  moveData: MoveData | null = null;
}

@Component({
  selector: 'app-club-home',
  templateUrl: './club-home.component.html',
  styleUrls: ['./club-home.component.css']
})
export class ClubHomeComponent {

  isMember: boolean = false;
  clubId: string = "";
  club: Club | null = null;
  whiteStudies: StudyCard[] = [];
  blackStudies: StudyCard[] = [];
  constructor(private titleService: Title, private router: Router, private route: ActivatedRoute, private clubService: ClubService, private userService: UserService){
    this.clubId = this.route.snapshot.paramMap.get('id') ?? '';
    
    let hasMemberPromise = this.clubService.hasMember(this.clubId, this.userService.getUserId())
      .pipe(map((hasMember) => {
        this.isMember = hasMember;

        if(this.isMember){
          this.clubService.getClub(this.clubId).subscribe((c) => {
            this.titleService.setTitle(c.name ?? 'Club Home');

            this.club = c;
            this.whiteStudies = c.studies.filter(s => s.perspective == Color.White).map((s) => {
              let sc = <StudyCard>s;
              let move = new Move();
              move.fen = s.summaryFEN;
              move.name = "";
              move.from = "";
              move.to = "";
              sc.moveData = {
                  move: move,
                  studyId: null,
                  studyTitle: null,
                  source: null,
                  direction: null,
                  player: s.perspective ?? Color.White,
                  extra: null
              }
              return sc;
            });
            this.blackStudies = c.studies.filter(s => s.perspective == Color.Black).map((s) => {
              let sc = <StudyCard>s;
              let move = new Move();
              move.fen = s.summaryFEN;
              move.name = "";
              move.from = "";
              move.to = "";
              sc.moveData = {
                  move: move,
                  studyId: null,
                  studyTitle: null,
                  source: null,
                  direction: null,
                  player: s.perspective ?? Color.White,
                  extra: null
              }
              return sc;
            });
          });
        }
      }))
      .subscribe();
  }

  isOwner(username: string){
    return username == this.club?.owner?.username;
  }

  getDefault(){
    return 'assets/avatars/club/default-pic.png';
  }
  join(){

  }

  leave(){

  }

  gotoStudy = (study: Study | null) => {
    if(study){
    console.log("goto")
      this.router.navigate(['study/' + study.id]);
    }
  }
}
