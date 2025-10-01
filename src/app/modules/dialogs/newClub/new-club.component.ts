import { Component, Inject  } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-club',
  templateUrl: './new-club.component.html',
  styleUrls: ['./new-club.component.css']
})
export class NewClubDialogComponent {
  title: string = '';
  description: string = '';
  
  constructor(private clubService: ClubService, @Inject(MAT_DIALOG_DATA) public data: any){
  }

  submit(){

  }

  cancel(){

  }
}
