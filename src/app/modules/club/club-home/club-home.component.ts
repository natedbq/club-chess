import { Component } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { map, Observable } from 'rxjs';
import { Club, Color, Move, MoveData, Study, User } from '../../../chess-logic/models';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { StudyService } from '../../../services/study.service';
import { MatDialog } from '@angular/material/dialog';
import { SendInviteComponent } from '../../dialogs/sendInvite/send-invite.component';


@Component({
  selector: 'app-club-home',
  templateUrl: './club-home.component.html',
  styleUrls: ['./club-home.component.css']
})
export class ClubHomeComponent {

  isMember: boolean = false;
  clubId: string = "";
  club: Club | null = null;
  whiteStudies: Study[] = [];
  blackStudies: Study[] = [];
  privateWhiteStudies: Study[] = [];
  privateBlackStudies: Study[] = [];
  creatingInvite = false;
  inviteUsername = '';
  constructor(private titleService: Title, private router: Router, private route: ActivatedRoute,
    private studyService: StudyService, private clubService: ClubService, private userService: UserService, private dialog: MatDialog){
    this.clubId = this.route.snapshot.paramMap.get('id') ?? '';
    
    this.clubService.hasMember(this.clubId, this.userService.getUserId())
      .pipe(map((hasMember) => {
        this.isMember = hasMember;

        if(this.isMember){
          this.clubService.getClub(this.clubId).subscribe((c) => {
            
            this.titleService.setTitle(c.name ?? 'Club Home');

            this.club = c;
            this.updateStudies();
            c.members.sort((a,b) => {
              if(this.isOwner(a.username ?? '')){
                return -1;
              }
              if(this.isOwner(b.username ?? '')){
                return 1;
              }
              return (a.username ?? '').localeCompare(b.username ?? '');
            })

            this.studyService.getSimpleStudies().subscribe((studies) => {
              this.privateWhiteStudies = studies.filter(s => s.perspective == Color.White);
              this.privateBlackStudies = studies.filter(s => s.perspective == Color.Black);
            })
          });
        }
      }))
      .subscribe();
  }

  isOwner = (username?: string) => {
    if(username){
      return username == this.club?.owner?.username;
    }else{
      return this.userService.getUser()?.username == this.club?.owner?.username;
    }
  }

  getDefault(){
    return 'assets/club-chess/sign.png';
  }
  join(){

  }

  leave(){

  }

  gotoStudy = (study: Study | null) => {
    if(study){
      this.router.navigate(['study/' + study.id]);
    }
  }

  updateStudies(){
      this.whiteStudies = this.club?.studies.filter(s => s.perspective == Color.White) ?? [];
      this.blackStudies = this.club?.studies.filter(s => s.perspective == Color.Black) ?? [];
  }

  addToClub(study: Study){
    if(this.club?.id && study.id){
      this.clubService.addToClub(this.club?.id, study.id).subscribe();
      this.club.studies.push(study);
      this.updateStudies();
    }
  }
  
  removeFromClub(study: Study){
    if(this.club?.id && study.id){
      this.clubService.removeFromClub(this.club?.id, study.id).subscribe();
      this.club.studies = this.club.studies.filter(s => s.id != study.id);
      this.updateStudies();
    }
  }

  hasStudy = (id: string | null) => {
    return this.whiteStudies.some(s => s.id == id) || this.blackStudies.some(s => s.id == id);
  }

  kick(member:User){
    
  }

  createInvite(){
    this.dialog.open(SendInviteComponent, {data: { clubId: this.clubId, clubName: this.club?.name}});
  }
}
