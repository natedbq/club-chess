import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Club, Study, Color, User, ClubInvite } from '../../../../chess-logic/models';
import { ClubService } from '../../../../services/club.service';
import { SendInviteComponent } from '../../../dialogs/sendInvite/send-invite.component';
import { UserService } from '../../../../services/user.service';


@Component({
  selector: 'app-club-home-members',
  templateUrl: './members.component.html',
  styleUrls: ['../club-home.component.css']
})
export class MembersComponent implements OnChanges {

  @Input() club: Club | null = null;
  invites: ClubInvite[] = [];
  filteredMembers: User[] = [];
  userIsOwner: boolean = false;
  usernameFilter: string = '';
  firstFilter: string = '';
  lastFilter: string = '';
  constructor(private dialog: MatDialog, private clubServie: ClubService, private userService: UserService){
  }
  public ngOnChanges(changes: SimpleChanges){
    if(this.club?.id){
      this.filteredMembers = this.club.members;
      this.clubServie.getInvites(this.club.id).subscribe(invites => this.invites = invites);
      this.userIsOwner = this.isOwner();
    }
  }

  filter() {
    this.filteredMembers = this.club?.members.filter((u) => {
      return u.username?.includes(this.usernameFilter) && u.firstName?.includes(this.firstFilter) && u.lastName?.includes(this.lastFilter);
    }) ?? [];
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

  kick(member:User){
    if(member.username && this.club?.id){
      this.clubServie.removeMember(this.club.id, member.username).subscribe(() => {
        if(this.club){
          this.club.members = this.club.members.filter(m => m.username != member.username);
        }
      });
    }
  }

  createInvite(){
    const dialogRef = this.dialog.open(SendInviteComponent, {data: { clubId: this.club?.id, clubName: this.club?.name}});
    dialogRef.afterClosed().subscribe(result => {
    if(this.club?.id){
      this.clubServie.getInvites(this.club.id).subscribe(invites => this.invites = invites);
    }
    })
  }

  cancel(invite: ClubInvite){
    if(this.club?.id && invite.toUsername){
      this.clubServie.declineInvite(this.club?.id, invite.toUsername).subscribe(() => {
        this.invites = this.invites.filter(i => i.toUsername != invite.toUsername);
      });
    }
  }
}
