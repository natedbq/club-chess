import { Component } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { Observable } from 'rxjs';
import { Club } from '../../../chess-logic/models';

@Component({
  selector: 'app-club-explore',
  templateUrl: './club-explore.component.html',
  styleUrls: ['./club-explore.component.css']
})
export class ClubExploreComponent {

  clubs$: Observable<Club[]>;
  constructor(private clubService: ClubService){
    this.clubs$ = clubService.getClubs();
  }

  getDefault(){
    let defaults: string[] = [
      'https://i.imgur.com/Ivyt0Ly.png',
      'https://cdn.displate.com/artwork/857x1200/2023-02-24/410bf6aab075a60d48bb98f9ed743dd6_bf32446f0bb87296271e4b5d7566ff7f.jpg',
      'https://i.imgur.com/h39Apip.jpeg'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)] ;
  }
  join(){

  }

  leave(){

  }
}
