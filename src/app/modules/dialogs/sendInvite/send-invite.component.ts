import { Component, Inject  } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-send-invite',
  templateUrl: './send-invite.component.html',
  styleUrls: ['./send-invite.component.css']
})
export class SendInviteComponent {
  username: string = '';
  message: string | null = '';
  name: string;
  constructor(private clubService: ClubService, @Inject(MAT_DIALOG_DATA) public data: any){
    this.name = data.clubName;
  }

  login(){

  }
  cancel(){
    this.username = '';
    this.message = '';
  }

  send(){
    console.log(this.data.clubId, this.data.clubName)
    if(this.message?.trim() == ''){
      this.message = null;
    }
    this.clubService.invite(this.data.clubId, this.username, this.message).subscribe();
  }
}
