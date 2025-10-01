import { Component } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { map, Observable } from 'rxjs';
import { Club, ClubInvite } from '../../../chess-logic/models';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { NewClubDialogComponent } from '../../dialogs/newClub/new-club.component';

@Component({
  selector: 'app-club-explore',
  templateUrl: './club-explore.component.html',
  styleUrls: ['./club-explore.component.css']
})
export class ClubExploreComponent {

  clubs: Club[] = [];
  invites: ClubInvite[] = [];
  constructor(private router: Router, private clubService: ClubService, private userService: UserService, private dialog: MatDialog){
    clubService.getClubs().subscribe(clubs => this.clubs = clubs);
    userService.getClubInvites().subscribe(invites => this.invites = invites);
  }

  getDefault(){
    return 'assets/club-chess/sign.png';
  }
  join(){

  }

  leave(){

  }

  visit(clubId: string | null){
      if(!clubId){
        return;
      }
      this.router.navigate(['club/' + clubId]);
  }

  getClubInvites() {
    this.userService.getClubInvites().subscribe();
  }

  newClub(){
      this.dialog.open(NewClubDialogComponent, {data: { ower: this.userService.getUser() }});
  }

  accept(invite: ClubInvite){
    if(invite.clubId && invite.toUsername){
      let user = this.userService.getUser();
      this.clubService.addMember(invite.clubId, invite.toUsername).subscribe();
      this.clubs.filter(c => c.id == invite.clubId).forEach(c => {
        if(user)
          c.members.push(user);
      });
      this.invites = this.invites.filter(i => i.clubId != invite.clubId);
      window.location.reload();
    }
  }

  decline(invite: ClubInvite){
    if(invite.clubId && invite.toUsername){
      this.clubService.declineInvite(invite.clubId, invite.toUsername).subscribe();
      this.invites = this.invites.filter(i => i.clubId != invite.clubId);
    }
  }
}
