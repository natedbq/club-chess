import { Component } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { Observable } from 'rxjs';
import { Club } from '../../../chess-logic/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-club-explore',
  templateUrl: './club-explore.component.html',
  styleUrls: ['./club-explore.component.css']
})
export class ClubExploreComponent {

  clubs$: Observable<Club[]>;
  constructor(private router: Router, private clubService: ClubService){
    this.clubs$ = clubService.getClubs();
  }

  getDefault(){
    return 'assets/avatars/club/default-pic.png';
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
}
