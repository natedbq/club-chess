import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Club, Move, Position, Study } from "../chess-logic/models";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private readonly api: string = "http://localhost/chess.api/club";


  constructor(private http: HttpClient, private userService: UserService) { }

  public hasMember(clubId: string, userId: string){
    return this.http.get<boolean>(`${this.api}/${clubId}/hasMember/${userId}`);
  }

  public getClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.api).pipe(map((clubs) => {
        return clubs.map(s => Club.toClub(s));
    }));
  }

  public getClub(clubId: string){
    return this.http.get<Club>(`${this.api}/${clubId}?userId=${this.userService.getUserId()}`).pipe(map((club) => {
      return Club.toClub(club);
    }));
  }
}