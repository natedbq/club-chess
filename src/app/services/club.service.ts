import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Club, ClubInvite, Move, Position, Study } from "../chess-logic/models";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private readonly api: string = "http://localhost/chess.api/club";


  constructor(private http: HttpClient, private userService: UserService) { }

  public hasMember(clubId: string, userId: string){
    return this.http.get<boolean>(`${this.api}/${clubId}/hasMember/me`);
  }

  public getClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.api).pipe(map((clubs) => {
        return clubs.map(s => Club.toClub(s));
    }));
  }

  public addMember(clubId: string, username: string){
    return this.http.post<void>(`${this.api}/${clubId}/acceptInvite/${username}`, null);
  }

  public removeMember(clubId: string, username: string){
    return this.http.post<void>(`${this.api}/${clubId}/removeMember/${username}`, null);
  }

  public declineInvite(clubId: string, username: string){
    return this.http.post<void>(`${this.api}/${clubId}/declineInvite/${username}`, null);
  }

  public addToClub(clubId: string, studyId: string){
    return this.http.post<void>(`${this.api}/${clubId}/addStudy/${studyId}`, null);
  }

  public removeFromClub(clubId: string, studyId: string){
    return this.http.post<void>(`${this.api}/${clubId}/removeStudy/${studyId}`, null);
  }

  public request(clubId: string, username: string){
    
    return this.http.post<void>(`${this.api}/requestToJoin`, {
      fromUsername: username,
      clubId: clubId,
      message: 'wants to join your club.'
    });
  }

  public getInvites(clubId: string){
    return this.http.get<ClubInvite[]>(`${this.api}/${clubId}/invites`).pipe(map((invites) => {
      return invites.map(i => ClubInvite.toClubInvite(i));
    }));
  }

  public invite(clubId: string, username: string, message: string | null){
    return this.http.post<void>(`${this.api}/inviteToJoin`, {
      toUsername: username,
      fromUsername: this.userService.getUsername(),
      clubId: clubId,
      message: message ?? 'wants you to join their club.'
    });
  }

  public getClub(clubId: string){
    return this.http.get<Club>(`${this.api}/${clubId}`).pipe(map((club) => {
      return Club.toClub(club);
    }));
  }
}